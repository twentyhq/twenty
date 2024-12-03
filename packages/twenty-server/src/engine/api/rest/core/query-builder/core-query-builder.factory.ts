import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { CreateManyQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/create-many-query.factory';
import { CreateOneQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/create-one-query.factory';
import { CreateVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/create-variables.factory';
import { DeleteQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/delete-query.factory';
import { DeleteVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/delete-variables.factory';
import { FindDuplicatesQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/find-duplicates-query.factory';
import { FindDuplicatesVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/find-duplicates-variables.factory';
import { FindManyQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/find-many-query.factory';
import { FindOneQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/find-one-query.factory';
import { GetVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/get-variables.factory';
import { UpdateQueryFactory } from 'src/engine/api/rest/core/query-builder/factories/update-query.factory';
import { UpdateVariablesFactory } from 'src/engine/api/rest/core/query-builder/factories/update-variables.factory';
import { computeDepth } from 'src/engine/api/rest/core/query-builder/utils/compute-depth.utils';
import { parseCoreBatchPath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-batch-path.utils';
import { parseCorePath } from 'src/engine/api/rest/core/query-builder/utils/path-parsers/parse-core-path.utils';
import { Query } from 'src/engine/api/rest/core/types/query.type';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/service/domain-manager.service';

@Injectable()
export class CoreQueryBuilderFactory {
  constructor(
    private readonly deleteQueryFactory: DeleteQueryFactory,
    private readonly createOneQueryFactory: CreateOneQueryFactory,
    private readonly createManyQueryFactory: CreateManyQueryFactory,
    private readonly updateQueryFactory: UpdateQueryFactory,
    private readonly findOneQueryFactory: FindOneQueryFactory,
    private readonly findManyQueryFactory: FindManyQueryFactory,
    private readonly findDuplicatesQueryFactory: FindDuplicatesQueryFactory,
    private readonly deleteVariablesFactory: DeleteVariablesFactory,
    private readonly createVariablesFactory: CreateVariablesFactory,
    private readonly updateVariablesFactory: UpdateVariablesFactory,
    private readonly getVariablesFactory: GetVariablesFactory,
    private readonly findDuplicatesVariablesFactory: FindDuplicatesVariablesFactory,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly accessTokenService: AccessTokenService,
    private readonly domainManagerService: DomainManagerService,
  ) {}

  async getObjectMetadata(
    request: Request,
    parsedObject: string,
  ): Promise<{
    objectMetadataItems: ObjectMetadataEntity[];
    objectMetadataItem: ObjectMetadataEntity;
  }> {
    const { workspace } =
      await this.accessTokenService.validateTokenByRequest(request);

    const objectMetadataItems =
      await this.objectMetadataService.findManyWithinWorkspace(workspace.id);

    if (!objectMetadataItems.length) {
      throw new BadRequestException(
        `No object was found for the workspace associated with this API key. You may generate a new one here ${this.domainManagerService
          .buildWorkspaceURL({
            subdomain: workspace.subdomain,
            pathname: '/settings/developers',
          })
          .toString()}`,
      );
    }

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

  async delete(request: Request): Promise<Query> {
    const { object: parsedObject } = parseCorePath(request);
    const objectMetadata = await this.getObjectMetadata(request, parsedObject);

    const { id } = parseCorePath(request);

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

  async createOne(request: Request): Promise<Query> {
    const { object: parsedObject } = parseCorePath(request);
    const objectMetadata = await this.getObjectMetadata(request, parsedObject);

    const depth = computeDepth(request);

    return {
      query: this.createOneQueryFactory.create(objectMetadata, depth),
      variables: this.createVariablesFactory.create(request),
    };
  }

  async createMany(request: Request): Promise<Query> {
    const { object: parsedObject } = parseCoreBatchPath(request);
    const objectMetadata = await this.getObjectMetadata(request, parsedObject);
    const depth = computeDepth(request);

    return {
      query: this.createManyQueryFactory.create(objectMetadata, depth),
      variables: this.createVariablesFactory.create(request),
    };
  }

  async update(request: Request): Promise<Query> {
    const { object: parsedObject } = parseCorePath(request);
    const objectMetadata = await this.getObjectMetadata(request, parsedObject);

    const depth = computeDepth(request);

    const { id } = parseCorePath(request);

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

  async get(request: Request): Promise<Query> {
    const { object: parsedObject } = parseCorePath(request);
    const objectMetadata = await this.getObjectMetadata(request, parsedObject);

    const depth = computeDepth(request);

    const { id } = parseCorePath(request);

    return {
      query: id
        ? this.findOneQueryFactory.create(objectMetadata, depth)
        : this.findManyQueryFactory.create(objectMetadata, depth),
      variables: this.getVariablesFactory.create(id, request, objectMetadata),
    };
  }

  async findDuplicates(request: Request): Promise<Query> {
    const { object: parsedObject } = parseCorePath(request);
    const objectMetadata = await this.getObjectMetadata(request, parsedObject);
    const depth = computeDepth(request);

    return {
      query: this.findDuplicatesQueryFactory.create(objectMetadata, depth),
      variables: this.findDuplicatesVariablesFactory.create(request),
    };
  }
}
