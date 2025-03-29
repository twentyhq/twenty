import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';
import { capitalize } from 'twenty-shared/utils';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { CoreQueryBuilderFactory } from 'src/engine/api/rest/core/query-builder/core-query-builder.factory';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { overrideFieldValue } from 'src/utils/override-field-value.util';

@Injectable()
export class RestApiCoreServiceV2 {
  constructor(
    private readonly coreQueryBuilderFactory: CoreQueryBuilderFactory,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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

    return this.formatResult('delete', objectMetadataNameSingular, {
      id: recordToDelete.id,
    });
  }

  async createOne(request: Request) {
    const { body } = request;

    const { fieldMetadataByFieldName, objectMetadataNameSingular, repository } =
      await this.getRepositoryAndMetadataOrFail(request);

    const overriddenBody = await this.overrideDataByFieldMetadata(
      body,
      fieldMetadataByFieldName,
    );

    const createdRecord = await repository.save(overriddenBody);

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

    const { fieldMetadataByFieldName, objectMetadataNameSingular, repository } =
      await this.getRepositoryAndMetadataOrFail(request);

    const recordToUpdate = await repository.findOneOrFail({
      where: { id: recordId },
    });

    // Override field values based on their metadata types
    const overriddenBody = await this.overrideDataByFieldMetadata(
      request.body,
      fieldMetadataByFieldName,
    );

    const updatedRecord = await repository.save({
      ...recordToUpdate,
      ...overriddenBody,
    });

    return this.formatResult(
      'update',
      objectMetadataNameSingular,
      updatedRecord,
    );
  }

  private async overrideDataByFieldMetadata(
    data: any,
    fieldMetadataByFieldName: Record<string, FieldMetadataInterface>,
  ): Promise<any> {
    if (!data) {
      return data;
    }

    const result = {};

    for (const [key, value] of Object.entries(data)) {
      const fieldMetadata = fieldMetadataByFieldName[key];

      result[key] = await overrideFieldValue(fieldMetadata?.type, value);
    }

    return result;
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
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspace.id,
        objectMetadataNameSingular,
      );

    const fieldMetadataByFieldName =
      objectMetadata.objectMetadataMapItem.fields.reduce(
        (acc, field) => {
          acc[field.name] = field;

          return acc;
        },
        {} as Record<string, FieldMetadataInterface>,
      );

    return { fieldMetadataByFieldName, objectMetadataNameSingular, repository };
  }
}
