import { OpenAPIV3_1 } from 'openapi-types';

import { capitalize } from 'src/utils/capitalize';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  getDeleteResponse200,
  getJsonResponse,
  getFindManyResponse200,
  getCreateOneResponse201,
  getCreateManyResponse201,
  getFindOneResponse200,
  getUpdateOneResponse200,
} from 'src/engine/core-modules/open-api/utils/responses.utils';
import {
  getArrayRequestBody,
  getRequestBody,
} from 'src/engine/core-modules/open-api/utils/request-body.utils';

export const computeBatchPath = (
  item: ObjectMetadataEntity,
): OpenAPIV3_1.PathItemObject => {
  return {
    post: {
      tags: [item.namePlural],
      summary: `Create Many ${item.namePlural}`,
      operationId: `createMany${capitalize(item.namePlural)}`,
      parameters: [{ $ref: '#/components/parameters/depth' }],
      requestBody: getArrayRequestBody(capitalize(item.nameSingular)),
      responses: {
        '201': getCreateManyResponse201(item),
        '400': { $ref: '#/components/responses/400' },
        '401': { $ref: '#/components/responses/401' },
      },
    },
  } as OpenAPIV3_1.PathItemObject;
};

export const computeManyResultPath = (
  item: ObjectMetadataEntity,
): OpenAPIV3_1.PathItemObject => {
  return {
    get: {
      tags: [item.namePlural],
      summary: `Find Many ${item.namePlural}`,
      description: `**order_by**, **filter**, **limit**, **depth**, **starting_after** or **ending_before** can be provided to request your **${item.namePlural}**`,
      operationId: `findMany${capitalize(item.namePlural)}`,
      parameters: [
        { $ref: '#/components/parameters/orderBy' },
        { $ref: '#/components/parameters/filter' },
        { $ref: '#/components/parameters/limit' },
        { $ref: '#/components/parameters/depth' },
        { $ref: '#/components/parameters/startingAfter' },
        { $ref: '#/components/parameters/endingBefore' },
      ],
      responses: {
        '200': getFindManyResponse200(item),
        '400': { $ref: '#/components/responses/400' },
        '401': { $ref: '#/components/responses/401' },
      },
    },
    post: {
      tags: [item.namePlural],
      summary: `Create One ${item.nameSingular}`,
      operationId: `createOne${capitalize(item.nameSingular)}`,
      parameters: [{ $ref: '#/components/parameters/depth' }],
      requestBody: getRequestBody(capitalize(item.nameSingular)),
      responses: {
        '201': getCreateOneResponse201(item),
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
        '200': getFindOneResponse200(item),
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
    patch: {
      tags: [item.namePlural],
      summary: `Update One ${item.namePlural}`,
      operationId: `UpdateOne${capitalize(item.nameSingular)}`,
      parameters: [
        { $ref: '#/components/parameters/idPath' },
        { $ref: '#/components/parameters/depth' },
      ],
      requestBody: getRequestBody(capitalize(item.nameSingular)),
      responses: {
        '200': getUpdateOneResponse200(item),
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
