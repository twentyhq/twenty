import { UseGuards } from '@nestjs/common';
import {
    Args,
    ID,
    Mutation,
    Query,
    Resolver
} from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleInput, UpdateRoleInput } from 'src/engine/core-modules/role/inputs/index';
import { Role } from 'src/engine/core-modules/role/role.entity';
import { RoleService } from 'src/engine/core-modules/role/services/role.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { Repository } from 'typeorm';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => Role)
export class RoleResolver {
  constructor(
    @InjectRepository(Role, 'core')
    private readonly roleRepository: Repository<Role>,
    private readonly roleService: RoleService,
  ) {}

  @Query(() => [Role])
  async findAllRoles(
    @AuthUser() { id: userId }: User, 
    @Args('workspaceId', { type: () => ID }) workspaceId: string): Promise<Role[]>{
    if (!userId) {
      throw new Error('User id not found');
    }
    return await this.roleService.findAll({ workspaceId });
  }

  @Mutation(() => Role)
  async createRole(@AuthUser() { id: userId }: User,  
  @Args('createRoleInput') createRoleInput: CreateRoleInput): Promise<Role>{
    if (!userId) {
      throw new Error('User id not found');
    }

    let parent 

    if(createRoleInput.reportsTo) {
      parent = await this.roleService.findOne({id: createRoleInput.reportsTo})
    }

    const roleData = {
      ...createRoleInput,
      reportsTo: parent
    }

    const result = await this.roleService.createRole(roleData)


    return result
  }

  @Query(() => Role)
  async findOneRole(@AuthUser() { id: userId }: User, 
  @Args('roleId', { type: () => ID }) roleId: string) : Promise<Role | null>{
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!roleId) {
      throw new Error('Role id not found');
    }

    return await this.roleService.findOne({ id: roleId });
  }

  @Mutation(() => Role)
  async updateRole(
    @AuthUser() { id: userId }: User, 
    @Args('id', { type: () => ID }) id: string,
    @Args('updateRoleInput') updateRoleInput: UpdateRoleInput
  ): Promise<Role> {
    if (!userId) {
      throw new Error('User id not found');
    }

    const existingRole = await this.roleService.findOne({ id });
    
    if (!existingRole) {
      throw new Error('Role not found');
    }
    
    let parent;

    if (updateRoleInput.reportsTo) {
      parent = await this.roleService.findOne({ id: updateRoleInput.reportsTo });
    }

    const updatedRoleData = {
      ...existingRole,
      ...updateRoleInput,
      reportsTo: parent ? parent : existingRole.reportsTo, 
    };


    const result = await this.roleService.updateRole({id, data: updatedRoleData});

    return result;

  }

  @Mutation(() => Role)
  async deleteRole(@AuthUser() { id: userId }: User,  @Args('roleId', { type: () => ID }) roleId: string): Promise<Role>{
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!roleId) {
      throw new Error('Role id not found');
    }

    const roleToDelete = await this.roleService.findOne({ id: roleId });

    if (!roleToDelete) {
      throw new Error('Role not found');
    }

    await this.roleService.delete({ id: roleId });

    return roleToDelete
  }

  @Mutation(() => Role)
  async toggleRoleStatus(@AuthUser() { id: userId }: User, @Args('roleId', { type: () => ID }) roleId: string): Promise<Role>{
    if (!userId) {
      throw new Error('User id not found');
    }

    const existingRole = await this.roleService.findOne({ id: roleId });
    
    if (!existingRole) {
      throw new Error('Role not found');
    }

    return await this.roleService.toggleRoleStatus( roleId );
  }

  @Mutation(() => User)
  async assignRoleToUser(
    @AuthUser() { id: userId }: User, 
    @Args('roleId', { type: () => ID } ) roleId: string 
  ): Promise<User>{
    if (!userId) {
      throw new Error('User id not found');
    }

    if (!roleId) {
      throw new Error('Role id not found');
    }
    
    return await this.roleService.assignRoleToUser( userId, roleId );
  }
}
