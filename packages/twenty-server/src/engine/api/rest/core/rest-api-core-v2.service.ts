import { BadRequestException, Injectable } from '@nestjs/common';

import { capitalize, isDefined } from 'twenty-shared/utils';
import { Request } from 'express';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import { ApiEventEmitterService } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

@Injectable()
export class RestApiCoreServiceV2 {
  constructor(
    private readonly coreQueryBuilderFactory: CoreQueryBuilderFactory,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly recordInputTransformerService: RecordInputTransformerService,
    protected readonly apiEventEmitterService: ApiEventEmitterService,
  ) {}

  async delete(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadataNameSingular, objectMetadata, repository } =
      await this.getRepositoryAndMetadataOrFail(request);
    const recordToDelete = await repository.findOneOrFail({
      where: { id: recordId },
    });

    await repository.delete(recordId);

    this.apiEventEmitterService.emitDestroyEvents(
      [recordToDelete],
      this.getAuthContextFromRequest(request),
      objectMetadata.objectMetadataMapItem,
    );

    return this.formatResult('delete', objectMetadataNameSingular, {
      id: recordToDelete.id,
    });
  }

  async createOne(request: Request) {
    const { objectMetadataNameSingular, objectMetadata, repository } =
      await this.getRepositoryAndMetadataOrFail(request);

    const overriddenBody = await this.recordInputTransformerService.process({
      recordInput: request.body,
      objectMetadataMapItem: objectMetadata.objectMetadataMapItem,
    });

    const recordExists =
      isDefined(overriddenBody.id) &&
      (await repository.exists({
        where: {
          id: overriddenBody.id,
        },
      }));

    if (recordExists) {
      throw new BadRequestException('Record already exists');
    }

    const createdRecord = await repository.save(overriddenBody);

    this.apiEventEmitterService.emitCreateEvents(
      [createdRecord],
      this.getAuthContextFromRequest(request),
      objectMetadata.objectMetadataMapItem,
    );

    return this.formatResult(
      'create',
      objectMetadataNameSingular,
      createdRecord,
    );
  }

  async update(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadataNameSingular, objectMetadata, repository } =
      await this.getRepositoryAndMetadataOrFail(request);

    const recordToUpdate = await repository.findOneOrFail({
      where: { id: recordId },
    });

    const overriddenBody = await this.recordInputTransformerService.process({
      recordInput: request.body,
      objectMetadataMapItem: objectMetadata.objectMetadataMapItem,
    });

    const updatedRecord = await repository.save({
      ...recordToUpdate,
      ...overriddenBody,
    });

    this.apiEventEmitterService.emitUpdateEvents(
      [recordToUpdate],
      [updatedRecord],
      Object.keys(request.body),
      this.getAuthContextFromRequest(request),
      objectMetadata.objectMetadataMapItem,
    );

    return this.formatResult(
      'update',
      objectMetadataNameSingular,
      updatedRecord,
    );
  }

  private formatResult<T>(
    operation: 'delete' | 'create' | 'update' | 'find',
    objectNameSingular: string,
    data: T,
  ) {
    const result = {
      data: {
        [operation + capitalize(objectNameSingular)]: data,
      },
    };

    return result;
  }

  private async getRepositoryAndMetadataOrFail(request: Request) {
    const { workspace } = request;
    const { object: parsedObject } = parseCorePath(request);

    const objectMetadata = await this.coreQueryBuilderFactory.getObjectMetadata(
      request,
      parsedObject,
    );

    if (!objectMetadata) {
      throw new BadRequestException('Object metadata not found');
    }

    if (!workspace?.id) {
      throw new BadRequestException('Workspace not found');
    }

    const objectMetadataNameSingular =
      objectMetadata.objectMetadataMapItem.nameSingular;
    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ObjectRecord>(
        workspace.id,
        objectMetadataNameSingular,
      );

    return {
      objectMetadataNameSingular,
      objectMetadata,
      repository,
    };
  }

  private getAuthContextFromRequest(request: Request): AuthContext {
    return {
      user: request.user,
      workspace: request.workspace,
      apiKey: request.apiKey,
      workspaceMemberId: request.workspaceMemberId,
      userWorkspaceId: request.userWorkspaceId,
    };
  }
}
