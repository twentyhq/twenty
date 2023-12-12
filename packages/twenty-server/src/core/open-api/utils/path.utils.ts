import {
  computeDepthParameters,
  computeFilterParameters,
  computeIdPathParameter,
  computeLastCursorParameters,
  computeLimitParameters,
  computeOrderByParameters,
} from 'src/core/open-api/utils/parameters.utils';
import { capitalize } from 'src/utils/capitalize';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import {
  getDeleteResponse200,
  getJsonResponse,
  getManyResultResponse200,
  getSingleResultSuccessResponse,
} from 'src/core/open-api/utils/responses.utils';
import { getRequestBody } from 'src/core/open-api/utils/request-body.utils';

export const computeManyResultPath = (item: ObjectMetadataEntity) => {
  return {
    get: {
      tags: [item.namePlural],
      summary: `Find Many ${item.namePlural}`,
      description: `**order_by**, **filter**, **limit**, **depth** or **last_cursor** can be provided to request your **${item.namePlural}**`,
      operationId: `findMany${capitalize(item.namePlural)}`,
      parameters: [
        computeOrderByParameters(item),
        computeFilterParameters(item),
        computeLimitParameters(item),
        computeDepthParameters(item),
        computeLastCursorParameters(item),
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
      parameters: [computeDepthParameters(item)],
      requestBody: getRequestBody(item),
      responses: {
        '201': getSingleResultSuccessResponse(item),
        '400': { $ref: '#/components/responses/400' },
        '401': { $ref: '#/components/responses/401' },
      },
    },
  };
};

export const computeSingleResultPath = (item: ObjectMetadataEntity) => {
  return {
    get: {
      tags: [item.namePlural],
      summary: `Find One ${item.nameSingular}`,
      description: `**depth** can be provided to request your **${item.nameSingular}**`,
      operationId: `findOne${capitalize(item.nameSingular)}`,
      parameters: [computeIdPathParameter(item), computeDepthParameters(item)],
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
      parameters: [computeIdPathParameter(item)],
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
      parameters: [computeIdPathParameter(item), computeDepthParameters(item)],
      requestBody: getRequestBody(item),
      responses: {
        '200': getSingleResultSuccessResponse(item),
        '400': { $ref: '#/components/responses/400' },
        '401': { $ref: '#/components/responses/401' },
      },
    },
  };
};

export const computeOpenApiPath = () => {
  return {
    get: {
      tags: ['others'],
      summary: 'Get Open Api Schema',
      operationId: 'GetOpenApiSchema',
      responses: {
        '200': getJsonResponse(),
      },
    },
  };
};
