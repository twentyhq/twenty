import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { Permission } from 'src/engine/core-modules/permission/permission.entity';
import { UpdateRoleHandler } from 'src/engine/core-modules/role/interfaces/Update';
import { Role } from 'src/engine/core-modules/role/role.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { CreateRoleHandler } from '../interfaces/Create';
import { DeleteRoleHandler } from '../interfaces/Delete';
import { GetAllRolesHandler } from '../interfaces/GetAll';

// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class RoleService extends TypeOrmQueryService<Role> {
  constructor(
    @InjectRepository(Role, 'core')
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(Permission, 'core')
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,

    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {
    super(roleRepository);
  }

  createRole: CreateRoleHandler = async (data) => {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: data.workspaceId,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const createdRole = this.roleRepository.create({
      name: data.name,
      description: data.description,
      canAccessWorkspaceSettings: data.canAccessWorkspaceSettings,
      reportsTo: data.reportsTo,
      workspace: workspace,
    });

    await this.roleRepository.save(createdRole);

    if (data.permissions && data.permissions.length > 0) {
      const permissions = data.permissions.map((permissionData) => {
        return this.permissionRepository.create({
          ...permissionData,
          role: createdRole,
        });
      });

      await this.permissionRepository.save(permissions);

      createdRole.permissions = permissions;
    }

    return this.roleRepository.save(createdRole);
  };

  findAll: GetAllRolesHandler = async (data) => {
    const [roles] = await this.roleRepository.findAndCount({
      where: {
        workspace: {
          id: data.workspaceId,
        },
      },
      relations: ['permissions', 'reportsTo', 'workspace', 'users'],
      order: {
        createdAt: 'DESC',
      },
    });

    return roles;
  };

  findOne = async ({ id }) => {
    const role = await this.roleRepository.findOne({
      relations: ['permissions', 'reportsTo', 'workspace'],
      where: {
        id,
      },
    });

    return role;
  };

  findOneByName = async ({ name }) => {
    const role = await this.roleRepository.findOne({
      relations: ['permissions', 'reportsTo', 'workspace'],
      where: {
        name,
      },
    });

    return role;
  };

  updateRole: UpdateRoleHandler = async ({ id, data }) => {
    const role = await this.roleRepository.findOne({
      where: {
        id,
      },
      relations: ['permissions', 'reportsTo', 'workspace'],
    });
    const updatedRoleData = {
      ...role,
      ...data,
    };

    if (data.permissions && data.permissions.length > 0 && role) {
      await this.permissionRepository.remove(role.permissions);

      const newPermissions = data.permissions.map((permissionData) => {
        return this.permissionRepository.create({
          ...permissionData,
          role: role,
        });
      });

      updatedRoleData.permissions =
        await this.permissionRepository.save(newPermissions);
    }

    return this.roleRepository.save(updatedRoleData);
  };

  delete: DeleteRoleHandler = async ({ id }) => {
    const role = await this.findOne({
      id,
    });

    if (role) {
      const { affected } = await this.roleRepository.delete(id);

      if (!affected)
        throw new BadRequestException(undefined, {
          description: `Erro ao remover o nível de acesso ${role.name}.`,
        });

      return affected ? true : false;
    }

    throw new BadRequestException(undefined, {
      description: `Nível de acesso com o id: ${id} não encontrado.`,
    });
  };

  toggleRoleStatus = async (id: string) => {
    const role = await this.roleRepository.findOne({
      where: {
        id,
      },
    });

    const updatedRoleData = {
      ...role,
      isActive: !role?.isActive,
    };

    return this.roleRepository.save(updatedRoleData);
  };

  assignRoleToUser = async (userId: string, roleId: string) => {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const role = await this.roleRepository.findOne({ where: { id: roleId } });

    if (!role) {
      throw new Error('Role not found');
    }

    await this.userRepository.save(user);

    return user;
  };
}
