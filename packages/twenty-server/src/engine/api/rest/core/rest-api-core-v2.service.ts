import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';
import { capitalize } from 'twenty-shared/utils';
import { FindOptionsWhere, ObjectLiteral } from 'typeorm';

import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { FieldValue } from 'src/engine/api/rest/core/types/field-value.type';
import { FilterInputFactory } from 'src/engine/api/rest/input-factories/filter-input.factory';
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
    private readonly filterInputFactory: FilterInputFactory,
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
      objectMetadata,
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
      const filter = this.filterInputFactory.create(request, objectMetadata);

      const records = await repository.find({
        take: limit,
        // where: this.getWhereFilter(filter), // to use the computed filter
      });

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

  private getWhereFilter(
    filterObject: Record<string, FieldValue>,
  ): FindOptionsWhere<ObjectLiteral> {
    if (!filterObject) return {};

    const processCondition = (
      condition: Record<string, FieldValue>,
    ): FindOptionsWhere<ObjectLiteral> => {
      let result: FindOptionsWhere<ObjectLiteral> = {};

      for (const key in condition) {
        const value = condition[key];

        if (key === 'and' && Array.isArray(value)) {
          // Merge "and" conditions into the same object
          result = value.reduce(
            (acc, subCondition) => ({
              ...acc,
              ...processCondition(subCondition as Record<string, FieldValue>),
            }),
            result,
          );
        } else if (key === 'or' && Array.isArray(value)) {
          // Keep OR as an array inside the "or" key
          result['or'] = value.map((subCondition) =>
            processCondition(subCondition as Record<string, FieldValue>),
          );
        } else if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // Recursively process nested objects
          const subCondition = processCondition(
            value as Record<string, FieldValue>,
          );

          if ('eq' in subCondition) {
            result[key] = (subCondition as any).eq; // Flatten { eq: value } → value
          } else {
            result[key] = subCondition;
          }
        } else {
          // Directly assign primitive values (string, number, boolean)
          result[key] = value;
        }
      }

      return result;
    };

    return processCondition(filterObject);
  }
}
