import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { buildCreatedByFromApiKey } from 'src/engine/core-modules/actor/utils/build-created-by-from-api-key.util';
import { buildCreatedByFromFullNameMetadata } from 'src/engine/core-modules/actor/utils/build-created-by-from-full-name-metadata.util';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RecordToCreateData = Record<string, any>;

@Injectable()
export class CreatedByFromAuthContextService {
  private readonly logger = new Logger(CreatedByFromAuthContextService.name);

  constructor(
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  injectCreatedBy(
    records: RecordToCreateData[],
    objectName: string,
    authContext: AuthContext,
  ): Promise<RecordToCreateData[]>;

  injectCreatedBy(
    record: RecordToCreateData,
    objectName: string,
    authContext: AuthContext,
  ): Promise<RecordToCreateData>;

  async injectCreatedBy(
    recordOrRecords: RecordToCreateData | RecordToCreateData[],
    objectName: string,
    authContext: AuthContext,
  ): Promise<RecordToCreateData | RecordToCreateData[]> {
    // TODO: Once all objects have it, we can remove this check
    const createdByFieldMetadata = await this.fieldMetadataRepository.findOne({
      where: {
        object: {
          nameSingular: objectName,
        },
        name: 'createdBy',
        workspaceId: authContext.workspace.id,
      },
    });

    if (!createdByFieldMetadata) {
      return recordOrRecords;
    }

    const createdBy = await this.buildCreatedBy(authContext);

    if (Array.isArray(recordOrRecords)) {
      for (const datum of recordOrRecords) {
        this.injectCreatedByToRecord(createdBy, datum);
      }
    } else {
      this.injectCreatedByToRecord(createdBy, recordOrRecords);
    }

    return recordOrRecords;
  }

  private injectCreatedByToRecord(
    createdBy: ActorMetadata,
    record: RecordToCreateData,
  ) {
    // Front-end can fill the source field
    if (createdBy && (!record.createdBy || !record.createdBy?.name)) {
      record.createdBy = {
        ...createdBy,
        source: record.createdBy?.source ?? createdBy.source,
      };
    }
  }

  private async buildCreatedBy(
    authContext: AuthContext,
  ): Promise<ActorMetadata> {
    const { workspace, workspaceMemberId, user, apiKey } = authContext;

    // TODO: remove that code once we have the workspace member id in all tokens
    if (isDefined(workspaceMemberId) && isDefined(user)) {
      return buildCreatedByFromFullNameMetadata({
        fullNameMetadata: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
        workspaceMemberId,
      });
    }

    if (isDefined(user)) {
      this.logger.warn("User doesn't have a workspace member id in the token");

      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
          workspace.id,
          'workspaceMember',
        );

      const workspaceMember = await workspaceMemberRepository.findOneOrFail({
        where: {
          userId: user.id,
        },
      });

      return buildCreatedByFromFullNameMetadata({
        fullNameMetadata: workspaceMember.name,
        workspaceMemberId: workspaceMember.id,
      });
    }

    if (isDefined(apiKey)) {
      return buildCreatedByFromApiKey({
        apiKey,
      });
    }

    throw new Error(
      'Unable to build createdBy metadata - no valid actor information found in auth context',
    );
  }
}
