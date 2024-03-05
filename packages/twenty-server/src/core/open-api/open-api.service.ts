import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { OpenAPIV3_1 } from 'openapi-types';

import { TokenService } from 'src/core/auth/services/token.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { baseSchema } from 'src/core/open-api/utils/base-schema.utils';
import {
  computeManyResultPath,
  computeSingleResultPath,
} from 'src/core/open-api/utils/path.utils';
import { getErrorResponses } from 'src/core/open-api/utils/get-error-responses.utils';
import {
  computeMetadataSchemaComponents,
  computeParameterComponents,
  computeSchemaComponents,
} from 'src/core/open-api/utils/components.utils';
import { computeSchemaTags } from 'src/core/open-api/utils/compute-schema-tags.utils';
import { computeWebhooks } from 'src/core/open-api/utils/computeWebhooks.utils';
import { capitalize } from 'src/utils/capitalize';
import {
  getDeleteResponse200,
  getManyResultResponse200,
  getSingleResultSuccessResponse,
} from 'src/core/open-api/utils/responses.utils';
import { getRequestBody } from 'src/core/open-api/utils/request-body.utils';

@Injectable()
export class OpenApiService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  async generateCoreSchema(request: Request): Promise<OpenAPIV3_1.Document> {
    const schema = baseSchema('core');

    let objectMetadataItems;

    try {
      const { workspace } = await this.tokenService.validateToken(request);

      objectMetadataItems =
        await this.objectMetadataService.findManyWithinWorkspace(workspace.id);
    } catch (err) {
      return schema;
    }

    if (!objectMetadataItems.length) {
      return schema;
    }
    schema.paths = objectMetadataItems.reduce((paths, item) => {
      paths[`/${item.namePlural}`] = computeManyResultPath(item);
      paths[`/${item.namePlural}/{id}`] = computeSingleResultPath(item);

      return paths;
    }, schema.paths as OpenAPIV3_1.PathsObject);

    schema.webhooks = objectMetadataItems.reduce(
      (paths, item) => {
        paths[`Create ${item.nameSingular}`] = computeWebhooks('create', item);
        paths[`Update ${item.nameSingular}`] = computeWebhooks('update', item);
        paths[`Delete ${item.nameSingular}`] = computeWebhooks('delete', item);

        return paths;
      },
      {} as Record<
        string,
        OpenAPIV3_1.PathItemObject | OpenAPIV3_1.ReferenceObject
      >,
    );

    schema.tags = computeSchemaTags(objectMetadataItems);

    schema.components = {
      ...schema.components, // components.securitySchemes is defined in base Schema
      schemas: computeSchemaComponents(objectMetadataItems),
      parameters: computeParameterComponents(),
      responses: {
        '400': getErrorResponses('Invalid request'),
        '401': getErrorResponses('Unauthorized'),
      },
    };

    return schema;
  }

  async generateMetaDataSchema(): Promise<OpenAPIV3_1.Document> {
    //TODO Add once Rest MetaData api is ready
    const schema = baseSchema('metadata');

    schema.tags = [{ name: 'placeholder' }];

    const metadata = [
      {
        nameSingular: 'object',
        namePlural: 'objects',
      },
      {
        nameSingular: 'field',
        namePlural: 'fields',
      },
      {
        nameSingular: 'relation',
        namePlural: 'relations',
      },
    ];

    schema.paths = metadata.reduce((path, item) => {
      path[`/${item.namePlural}`] = {
        get: {
          tags: [item.namePlural],
          summary: `Find Many ${item.namePlural}`,
          parameters: [{ $ref: '#/components/parameters/filter' }],
          responses: {
            '200': getManyResultResponse200(item),
            '400': { $ref: '#/components/responses/400' },
            '401': { $ref: '#/components/responses/401' },
          },
        },
        post: {
          tags: [item.namePlural],
          summary: `Create One ${item.nameSingular}`,
          operationId: `createOne${capitalize(item.nameSingular)}`,
          requestBody: getRequestBody(item),
          responses: {
            '200': getSingleResultSuccessResponse(item),
            '400': { $ref: '#/components/responses/400' },
            '401': { $ref: '#/components/responses/401' },
          },
        },
      } as OpenAPIV3_1.PathItemObject;
      path[`/${item.namePlural}/{id}`] = {
        get: {
          tags: [item.namePlural],
          summary: `Find One ${item.nameSingular}`,
          parameters: [{ $ref: '#/components/parameters/idPath' }],
          responses: {
            '200': getSingleResultSuccessResponse(item),
            '400': { $ref: '#/components/responses/400' },
            '401': { $ref: '#/components/responses/401' },
          },
        },
        delete: {
          tags: [item.namePlural],
          summary: `Delete One ${item.nameSingular}`,
          operationId: `deleteOne${capitalize(item.nameSingular)}`,
          parameters: [{ $ref: '#/components/parameters/idPath' }],
          responses: {
            '200': getDeleteResponse200(item),
            '400': { $ref: '#/components/responses/400' },
            '401': { $ref: '#/components/responses/401' },
          },
        },
        put: {
          tags: [item.namePlural],
          summary: `Update One ${item.namePlural}`,
          operationId: `updateOne${capitalize(item.nameSingular)}`,
          parameters: [{ $ref: '#/components/parameters/idPath' }],
          requestBody: getRequestBody(item),
          responses: {
            '200': getSingleResultSuccessResponse(item),
            '400': { $ref: '#/components/responses/400' },
            '401': { $ref: '#/components/responses/401' },
          },
        },
      } as OpenAPIV3_1.PathItemObject;

      return path;
    }, schema.paths as OpenAPIV3_1.PathsObject);

    schema.components = {
      ...schema.components, // components.securitySchemes is defined in base Schema
      schemas: computeMetadataSchemaComponents(metadata),
      parameters: computeParameterComponents(),
      responses: {
        '400': getErrorResponses('Invalid request'),
        '401': getErrorResponses('Unauthorized'),
      },
    };

    return schema;
  }
}
