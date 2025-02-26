import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { capitalize } from 'twenty-shared/utils';

import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { buildQueryWithFilters } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/filter-query-builder.utils';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { LimitInputFactory } from 'src/engine/api/rest/input-factories/limit-input.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

interface FormatResultParams<T> {
  operation: 'delete' | 'create' | 'update' | 'findOne' | 'findMany';
  objectNameSingular?: string;
  objectNamePlural?: string;
  data: T;
  meta?: any;
}
@Injectable()
export class RestApiCoreServiceV2 {
  constructor(
    private readonly coreQueryBuilderFactory: CoreQueryBuilderFactory,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly limitInputFactory: LimitInputFactory,
  ) {}

  async delete(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadataNameSingular, repository } =
      await this.getRepositoryAndMetadataOrFail(request);
    const recordToDelete = await repository.findOneOrFail({
      where: { id: recordId },
    });

    await repository.delete(recordId);

    return this.formatResult({
      operation: 'delete',
      objectNameSingular: objectMetadataNameSingular,
      data: {
        id: recordToDelete.id,
      },
    });
  }

  async createOne(request: Request) {
    const { body } = request;

    const { objectMetadataNameSingular, repository } =
      await this.getRepositoryAndMetadataOrFail(request);
    const createdRecord = await repository.save(body);

    return this.formatResult({
      operation: 'create',
      objectNameSingular: objectMetadataNameSingular,
      data: createdRecord,
    });
  }

  async update(request: Request) {
    const { id: recordId } = parseCorePath(request);

    if (!recordId) {
      throw new BadRequestException('Record ID not found');
    }

    const { objectMetadataNameSingular, repository } =
      await this.getRepositoryAndMetadataOrFail(request);

    const recordToUpdate = await repository.findOneOrFail({
      where: { id: recordId },
    });

    const updatedRecord = await repository.save({
      ...recordToUpdate,
      ...request.body,
    });

    return this.formatResult({
      operation: 'update',
      objectNameSingular: objectMetadataNameSingular,
      data: updatedRecord,
    });
  }

  async get(request: Request) {
    const { id: recordId } = parseCorePath(request);
    const {
      objectMetadataNameSingular,
      objectMetadataNamePlural,
      repository,
      // objectMetadata,
    } = await this.getRepositoryAndMetadataOrFail(request);

    if (recordId) {
      const record = await repository.findOne({
        where: { id: recordId },
      });

      return this.formatResult({
        operation: 'findOne',
        objectNameSingular: objectMetadataNameSingular,
        data: record,
      });
    } else {
      const limit = this.limitInputFactory.create(request);
      const filter = request.query.filter as string;

      const qb = repository.createQueryBuilder(objectMetadataNameSingular);
      const finalQuery = buildQueryWithFilters(
        qb,
        objectMetadataNameSingular,
        filter,
      );

      const records = await finalQuery.take(limit).getMany();

      return this.formatResult({
        objectNamePlural: objectMetadataNamePlural,
        operation: 'findMany',
        data: records,
      });
    }
  }

  private formatResult<T>({
    operation,
    objectNameSingular,
    objectNamePlural,
    data,
  }: FormatResultParams<T>) {
    let prefix;

    if (operation === 'findOne') {
      prefix = objectNameSingular || '';
    } else if (operation === 'findMany') {
      prefix = objectNamePlural || '';
    } else {
      prefix = operation + capitalize(objectNameSingular || '');
    }
    const result = {
      data: {
        [prefix]: data,
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
    const objectMetadataNamePlural =
      objectMetadata.objectMetadataMapItem.namePlural;
    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspace.id,
        objectMetadataNameSingular,
      );

    return {
      objectMetadataNameSingular,
      objectMetadataNamePlural,
      objectMetadata,
      repository,
    };
  }
}
