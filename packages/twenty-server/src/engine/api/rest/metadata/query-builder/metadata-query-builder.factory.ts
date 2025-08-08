import { BadRequestException, Injectable } from '@nestjs/common';

import { GetMetadataVariablesFactory } from 'src/engine/api/rest/metadata/query-builder/factories/get-metadata-variables.factory';
import { FindOneMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/find-one-metadata-query.factory';
import { FindManyMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/find-many-metadata-query.factory';
import { parseMetadataPath } from 'src/engine/api/rest/metadata/query-builder/utils/parse-metadata-path.utils';
import { CreateMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/create-metadata-query.factory';
import { UpdateMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/update-metadata-query.factory';
import { DeleteMetadataQueryFactory } from 'src/engine/api/rest/metadata/query-builder/factories/delete-metadata-query.factory';
import {
  type MetadataQuery,
  type Selectors,
} from 'src/engine/api/rest/metadata/types/metadata-query.type';
import { type RequestContext } from 'src/engine/api/rest/types/RequestContext';

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

  async get(
    request: RequestContext,
    selectors?: Selectors,
  ): Promise<MetadataQuery> {
    const { id, objectNameSingular, objectNamePlural } = parseMetadataPath(
      request.path,
    );

    return {
      query: id
        ? this.findOneQueryFactory.create(
            objectNameSingular,
            objectNamePlural,
            selectors,
          )
        : this.findManyQueryFactory.create(objectNamePlural, selectors),
      variables: this.getMetadataVariablesFactory.create(id, request),
    };
  }

  async create(
    { path, body }: Pick<RequestContext, 'path' | 'body'>,
    selectors?: Selectors,
  ): Promise<MetadataQuery> {
    const { objectNameSingular, objectNamePlural } = parseMetadataPath(path);

    return {
      query: this.createQueryFactory.create(
        objectNameSingular,
        objectNamePlural,
        selectors,
      ),
      variables: {
        input: {
          [objectNameSingular]: body,
        },
      },
    };
  }

  async update(
    request: Pick<RequestContext, 'path' | 'body'>,
    selectors?: Selectors,
  ): Promise<MetadataQuery> {
    const { objectNameSingular, objectNamePlural, id } = parseMetadataPath(
      request.path,
    );

    if (!id) {
      throw new BadRequestException(
        `update ${objectNameSingular} query invalid. Id missing. eg: /rest/metadata/${objectNameSingular}/0d4389ef-ea9c-4ae8-ada1-1cddc440fb56`,
      );
    }

    return {
      query: this.updateQueryFactory.create(
        objectNameSingular,
        objectNamePlural,
        selectors,
      ),
      variables: {
        input: {
          update: request.body,
          id,
        },
      },
    };
  }

  async delete(
    request: Pick<RequestContext, 'path' | 'body'>,
  ): Promise<MetadataQuery> {
    const { objectNameSingular, id } = parseMetadataPath(request.path);

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
