import { Injectable } from '@nestjs/common';

import { Request } from 'express';
import { OpenAPIV3_1 } from 'openapi-types';

import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { baseSchema } from 'src/engine/core-modules/open-api/utils/base-schema.utils';
import {
  computeManyResultPath,
  computeSingleResultPath,
} from 'src/engine/core-modules/open-api/utils/path.utils';
import { getErrorResponses } from 'src/engine/core-modules/open-api/utils/get-error-responses.utils';
import {
  computeMetadataSchemaComponents,
  computeParameterComponents,
  computeSchemaComponents,
} from 'src/engine/core-modules/open-api/utils/components.utils';
import { computeSchemaTags } from 'src/engine/core-modules/open-api/utils/compute-schema-tags.utils';
import { computeWebhooks } from 'src/engine/core-modules/open-api/utils/computeWebhooks.utils';
import { capitalize } from 'src/utils/capitalize';
import {
  getDeleteResponse200,
  getManyResultResponse200,
  getSingleResultSuccessResponse,
} from 'src/engine/core-modules/open-api/utils/responses.utils';
import { getRequestBody } from 'src/engine/core-modules/open-api/utils/request-body.utils';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { getServerUrl } from 'src/utils/get-server-url';

@Injectable()
export class OpenApiService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  async generateCoreSchema(request: Request): Promise<OpenAPIV3_1.Document> {
    const baseUrl = getServerUrl(
      request,
      this.environmentService.get('SERVER_URL'),
    );

    const schema = baseSchema('core', baseUrl);

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

  async generateMetaDataSchema(
    request: Request,
  ): Promise<OpenAPIV3_1.Document> {
    const baseUrl = getServerUrl(
      request,
      this.environmentService.get('SERVER_URL'),
    );

    const schema = baseSchema('metadata', baseUrl);

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
