import { BadRequestException, Injectable } from '@nestjs/common';

import { Request } from 'express';

import { GetMetadataVariablesFactory } from 'src/engine/api/rest/metadata/query-builder/factories/get-metadata-variables.factory';
import { FindOneMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/find-one-metadata-query.factory';
import { FindManyMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/find-many-metadata-query.factory';
import { parseMetadataPath } from 'src/engine/api/rest/metadata/query-builder/utils/parse-metadata-path.utils';
import { CreateMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/create-metadata-query.factory';
import { UpdateMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/update-metadata-query.factory';
import { DeleteMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/delete-metadata-query.factory';
import { MetadataQuery } from 'src/engine/api/rest/metadata/types/metadata-query.type';

@Injectable()
export class MetadataQueryBuilderFactory {
  constructor(
    private readonly findOneQueryFactory: FindOneMetadataQueryFactory,
    private readonly findManyQueryFactory: FindManyMetadataQueryFactory,
    private readonly createQueryFactory: CreateMetadataQueryFactory,
    private readonly updateQueryFactory: UpdateMetadataQueryFactory,
    private readonly deleteQueryFactory: DeleteMetadataQueryFactory,
    private readonly getMetadataVariablesFactory: GetMetadataVariablesFactory,
  ) {}

  async get(request: Request): Promise<MetadataQuery> {
    const { id, objectNameSingular, objectNamePlural } =
      parseMetadataPath(request);

    return {
      query: id
        ? this.findOneQueryFactory.create(objectNameSingular, objectNamePlural)
        : this.findManyQueryFactory.create(objectNamePlural),
      variables: this.getMetadataVariablesFactory.create(id, request),
    };
  }

  async create(request: Request): Promise<MetadataQuery> {
    const { objectNameSingular, objectNamePlural } = parseMetadataPath(request);

    return {
      query: this.createQueryFactory.create(
        objectNameSingular,
        objectNamePlural,
      ),
      variables: {
        input: {
          [objectNameSingular]: request.body,
        },
      },
    };
  }

  async update(request: Request): Promise<MetadataQuery> {
    const { objectNameSingular, objectNamePlural, id } =
      parseMetadataPath(request);

    if (!id) {
      throw new BadRequestException(
        `update ${objectNameSingular} query invalid. Id missing. eg: /rest/metadata/${objectNameSingular}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
      );
    }

    return {
      query: this.updateQueryFactory.create(
        objectNameSingular,
        objectNamePlural,
      ),
      variables: {
        input: {
          update: request.body,
          id,
        },
      },
    };
  }

  async delete(request: Request): Promise<MetadataQuery> {
    const { objectNameSingular, id } = parseMetadataPath(request);

    if (!id) {
      throw new BadRequestException(
        `delete ${objectNameSingular} query invalid. Id missing. eg: /rest/metadata/${objectNameSingular}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
      );
    }

    return {
      query: this.deleteQueryFactory.create(objectNameSingular),
      variables: {
        input: {
          id,
        },
      },
    };
  }
}
