import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Telephony } from 'src/engine/core-modules/telephony/telephony.entity';
import { CreateTelephonyHandler } from 'src/engine/core-modules/telephony/types/Create';
import { DeleteTelephonyHandler } from 'src/engine/core-modules/telephony/types/Delete';
import { GetAllTelephonyHandler } from 'src/engine/core-modules/telephony/types/GetAll';
import { UpdateTelephonyHandler } from 'src/engine/core-modules/telephony/types/Update';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class TelephonyService extends TypeOrmQueryService<Telephony> {
  constructor(
    @InjectRepository(Telephony, 'core')
    private readonly telephonyRepository: Repository<Telephony>,

    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,

    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(telephonyRepository);
  }

  findAll: GetAllTelephonyHandler = async (data) => {
    const [telephonys] = await this.telephonyRepository.findAndCount({
      where: {
        workspace: {
          id: data.workspaceId,
        },
      },
      relations: ['workspace'],
      order: {
        createdAt: 'DESC',
      },
    });

    return telephonys;
  };

  createTelehony: CreateTelephonyHandler = async (data) => {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: data.workspaceId,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    try {
      const createdTelephony = this.telephonyRepository.create({
        ...data,
        workspace,
      });

      return await this.telephonyRepository.save(createdTelephony);
    } catch (error) {
      throw new Error(
        'Error creating telephony. Maybe the member already has a number extension or the choosen extension is already in use.',
      );
    }
  };

  findOne = async ({ id }) => {
    const telephony = await this.telephonyRepository.findOne({
      where: {
        id,
      },
      relations: ['workspace'],
    });

    return telephony;
  };

  updateTelephony: UpdateTelephonyHandler = async ({ id, data }) => {
    const updateTelephonyData = {
      id,
      ...data,
    };

    return this.telephonyRepository.save(updateTelephonyData);
  };

  delete: DeleteTelephonyHandler = async ({ id }) => {
    const { affected } = await this.telephonyRepository.delete(id);

    if (!affected)
      throw new BadRequestException(undefined, {
        description: `Error deleting telephony with id ${id}`,
      });

    return affected ? true : false;
  };

  setExtensionNumberInWorkspaceMember = async (
    workspaceId: string,
    memberId: string,
    extensionNumber: string,
  ) => {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    await workspaceDataSource?.query(
      `UPDATE ${dataSourceMetadata.schema}."workspaceMember" SET "extensionNumber"='${extensionNumber}' WHERE "id"='${memberId}'`,
    );

    const updatedWorkspaceMember = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "id"='${memberId}'`,
    );

    return updatedWorkspaceMember?.[0] || null;
  };

  removeAgentIdInWorkspaceMember = async (
    workspaceId: string,
    memberId: string,
  ) => {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    await workspaceDataSource?.query(
      `UPDATE ${dataSourceMetadata.schema}."workspaceMember" SET "extensionNumber"='' WHERE "id"='${memberId}'`,
    );

    const updatedWorkspaceMember = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "id"='${memberId}'`,
    );

    return updatedWorkspaceMember?.[0] || null;
  };
}
