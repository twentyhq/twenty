import { OpenAPIV3_1 } from 'openapi-types';

import { capitalize } from 'src/utils/capitalize';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  getDeleteResponse200,
  getJsonResponse,
  getManyResultResponse200,
  getSingleResultSuccessResponse,
} from 'src/engine/core-modules/open-api/utils/responses.utils';
import { getRequestBody } from 'src/engine/core-modules/open-api/utils/request-body.utils';

export const computeManyResultPath = (
  item: ObjectMetadataEntity,
): OpenAPIV3_1.PathItemObject => {
  return {
    get: {
      tags: [item.namePlural],
      summary: `Find Many ${item.namePlural}`,
      description: `**order_by**, **filter**, **limit**, **depth** or **last_cursor** can be provided to request your **${item.namePlural}**`,
      operationId: `findMany${capitalize(item.namePlural)}`,
      parameters: [
        { $ref: '#/components/parameters/orderBy' },
        { $ref: '#/components/parameters/filter' },
        { $ref: '#/components/parameters/limit' },
        { $ref: '#/components/parameters/depth' },
        { $ref: '#/components/parameters/lastCursor' },
      ],
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
      parameters: [{ $ref: '#/components/parameters/depth' }],
      requestBody: getRequestBody(item),
      responses: {
        '201': getSingleResultSuccessResponse(item),
        '400': { $ref: '#/components/responses/400' },
        '401': { $ref: '#/components/responses/401' },
      },
    },
  } as OpenAPIV3_1.PathItemObject;
};

export const computeSingleResultPath = (
  item: ObjectMetadataEntity,
): OpenAPIV3_1.PathItemObject => {
  return {
    get: {
      tags: [item.namePlural],
      summary: `Find One ${item.nameSingular}`,
      description: `**depth** can be provided to request your **${item.nameSingular}**`,
      operationId: `findOne${capitalize(item.nameSingular)}`,
      parameters: [
        { $ref: '#/components/parameters/idPath' },
        { $ref: '#/components/parameters/depth' },
      ],
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
      operationId: `UpdateOne${capitalize(item.nameSingular)}`,
      parameters: [
        { $ref: '#/components/parameters/idPath' },
        { $ref: '#/components/parameters/depth' },
      ],
      requestBody: getRequestBody(item),
      responses: {
        '200': getSingleResultSuccessResponse(item),
        '400': { $ref: '#/components/responses/400' },
        '401': { $ref: '#/components/responses/401' },
      },
    },
  } as OpenAPIV3_1.PathItemObject;
};

export const computeOpenApiPath = (
  serverUrl: string,
): OpenAPIV3_1.PathItemObject => {
  return {
    get: {
      tags: ['General'],
      summary: 'Get Open Api Schema',
      operationId: 'GetOpenApiSchema',
      servers: [
        {
          url: serverUrl,
        },
      ],
      responses: {
        '200': getJsonResponse(),
      },
    },
  } as OpenAPIV3_1.PathItemObject;
};
