import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { DeleteQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/delete-query.factory';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { TokenService } from 'src/core/auth/services/token.service';
import { CreateQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/create-query.factory';
import { UpdateQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/update-query.factory';
import { FindOneQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/find-one-query.factory';
import { FindManyQueryFactory } from 'src/core/api-rest/api-rest-query-builder/factories/find-many-query.factory';
import { DeleteVariablesFactory } from 'src/core/api-rest/api-rest-query-builder/factories/delete-variables.factory';
import { CreateVariablesFactory } from 'src/core/api-rest/api-rest-query-builder/factories/create-variables.factory';
import { UpdateVariablesFactory } from 'src/core/api-rest/api-rest-query-builder/factories/update-variables.factory';
import { GetVariablesFactory } from 'src/core/api-rest/api-rest-query-builder/factories/get-variables.factory';
import { parsePath } from 'src/core/api-rest/api-rest-query-builder/utils/parse-path.utils';
import { computeDepth } from 'src/core/api-rest/api-rest-query-builder/utils/compute-depth.utils';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { ApiRestQuery } from 'src/core/api-rest/types/api-rest-query.type';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class ApiRestQueryBuilderFactory {
  constructor(
    private readonly deleteQueryFactory: DeleteQueryFactory,
    private readonly createQueryFactory: CreateQueryFactory,
    private readonly updateQueryFactory: UpdateQueryFactory,
    private readonly findOneQueryFactory: FindOneQueryFactory,
    private readonly findManyQueryFactory: FindManyQueryFactory,
    private readonly deleteVariablesFactory: DeleteVariablesFactory,
    private readonly createVariablesFactory: CreateVariablesFactory,
    private readonly updateVariablesFactory: UpdateVariablesFactory,
    private readonly getVariablesFactory: GetVariablesFactory,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async getObjectMetadata(request: Request): Promise<{
    objectMetadataItems: ObjectMetadataEntity[];
    objectMetadataItem: ObjectMetadataEntity;
  }> {
    const workspace = await this.tokenService.validateToken(request);

    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspace.id);

    if (!objectMetadataItems.length) {
      throw new BadRequestException(
        `No object was found for the workspace associated with this API key. You may generate a new one here ${this.environmentService.getFrontBaseUrl()}/settings/developers`,
      );
    }

    const { object: parsedObject } = parsePath(request);

    const [objectMetadata] = objectMetadataItems.filter(
      (object) => object.namePlural === parsedObject,
    );

    if (!objectMetadata) {
      const [wrongObjectMetadata] = objectMetadataItems.filter(
        (object) => object.nameSingular === parsedObject,
      );

      let hint = 'eg: companies';

      if (wrongObjectMetadata) {
        hint = `Did you mean '${wrongObjectMetadata.namePlural}'?`;
      }

      throw new BadRequestException(
        `object '${parsedObject}' not found. ${hint}`,
      );
    }

    return {
      objectMetadataItems,
      objectMetadataItem: objectMetadata,
    };
  }

  async delete(request: Request): Promise<ApiRestQuery> {
    const objectMetadata = await this.getObjectMetadata(request);

    const { id } = parsePath(request);

    if (!id) {
      throw new BadRequestException(
        `delete ${objectMetadata.objectMetadataItem.nameSingular} query invalid. Id missing. eg: /rest/${objectMetadata.objectMetadataItem.namePlural}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
      );
    }

    return {
      query: this.deleteQueryFactory.create(objectMetadata.objectMetadataItem),
      variables: this.deleteVariablesFactory.create(id),
    };
  }

  async create(request): Promise<ApiRestQuery> {
    const objectMetadata = await this.getObjectMetadata(request);

    const depth = computeDepth(request);

    return {
      query: this.createQueryFactory.create(objectMetadata, depth),
      variables: this.createVariablesFactory.create(request),
    };
  }

  async update(request): Promise<ApiRestQuery> {
    const objectMetadata = await this.getObjectMetadata(request);

    const depth = computeDepth(request);

    const { id } = parsePath(request);

    if (!id) {
      throw new BadRequestException(
        `update ${objectMetadata.objectMetadataItem.nameSingular} query invalid. Id missing. eg: /rest/${objectMetadata.objectMetadataItem.namePlural}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
      );
    }

    return {
      query: this.updateQueryFactory.create(objectMetadata, depth),
      variables: this.updateVariablesFactory.create(id, request),
    };
  }

  async get(request): Promise<ApiRestQuery> {
    const objectMetadata = await this.getObjectMetadata(request);

    const depth = computeDepth(request);

    const { id } = parsePath(request);

    return {
      query: id
        ? this.findOneQueryFactory.create(objectMetadata, depth)
        : this.findManyQueryFactory.create(objectMetadata, depth),
      variables: this.getVariablesFactory.create(id, request, objectMetadata),
    };
  }
}
