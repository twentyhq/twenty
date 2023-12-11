import { OrderByDirection } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

import { capitalize } from 'src/utils/capitalize';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { FilterComparators } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/filter-utils/parse-base-filter.utils';
import { Conjunctions } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/filter-utils/parse-filter.utils';

export const computeNodeProperties = (
  item: ObjectMetadataEntity,
): { [key: string]: { type: string; items: object } } => {
  return item.fields.reduce((node, field) => {
    let type = 'string';
    let relationItems = {};

    if (
      field.type === FieldMetadataType.NUMBER ||
      field.type === FieldMetadataType.NUMERIC ||
      field.type === FieldMetadataType.PROBABILITY ||
      field.type === FieldMetadataType.RATING
    ) {
      type = 'number';
    }

    if (field.type === FieldMetadataType.BOOLEAN) {
      type = 'boolean';
    }

    if (field.type === FieldMetadataType.RELATION) {
      type = 'array';
      relationItems = {
        type: 'object',
        properties: {
          node: {
            type: 'object',
          },
        },
      };
    }

    node[field.name] = {
      type,
    };

    if (relationItems) {
      node[field.name]['items'] = relationItems;
    }

    return node;
  }, {});
};

export const computeNodeExample = (item: ObjectMetadataEntity) => {
  return item.fields.reduce((node, field) => {
    if (field.type === FieldMetadataType.RELATION) {
      node[field.name] = { edges: [] };
    } else if (Object.keys(field.targetColumnMap).length) {
      node[field.name] = field.targetColumnMap.value
        ? field.name
        : field.targetColumnMap;
    } else {
      node[field.name] = field.name;
    }

    return node;
  }, {});
};

export const computeLimitParameters = (item: ObjectMetadataEntity) => {
  return {
    name: 'limit',
    in: 'query',
    description: `Integer value to limit the number of \`${item.namePlural}\` returned`,
    required: false,
    schema: {
      type: 'integer',
      minimum: 0,
      maximum: 60,
      default: 60,
    },
  };
};

export const computeOrderByParameters = (item: ObjectMetadataEntity) => {
  return {
    name: 'order_by',
    in: 'query',
    description: `A combination of fields and directions to sort \`${
      item.namePlural
    }\` returned. Should have the following shape: \`field_name_1[DIRECTION_1],field_name_2[DIRECTION_2],...\` Available directions are \`${Object.values(
      OrderByDirection,
    ).join('`, `')}\`. eg: GET /rest/companies?order_by=name[${
      OrderByDirection.AscNullsFirst
    }],createdAt[${OrderByDirection.DescNullsLast}]`,
    required: false,
    schema: {
      type: 'string',
    },
  };
};

export const computeDepthParameters = (item: ObjectMetadataEntity) => {
  return {
    name: 'depth',
    in: 'query',
    description: `Integer value to limit the depth of related objects of \`${item.namePlural}\` returned`,
    required: false,
    schema: {
      type: 'integer',
      enum: [1, 2],
    },
  };
};

export const computeFilterParameters = (item: ObjectMetadataEntity) => {
  return {
    name: 'filter',
    in: 'query',
    description: `A combination of fields, filter operations and values to filter \`${
      item.namePlural
    }\` returned. Should have the following shape: \`field_1[COMPARATOR]:value_1,field_2[COMPARATOR]:value_2,...\` Available comparators are \`${Object.values(
      FilterComparators,
    ).join(
      '`, `',
    )}\`. eg: GET /rest/companies?filter=name[eq]:"Airbnb".\n\nYou can create more complex filters using conjunctions \`${Object.values(
      Conjunctions,
    ).join(
      '`, `',
    )}\`. eg: GET /rest/companies?filter=or(name[eq]:"Airbnb",employees[gt]:1,not(name[is]:NULL),not(and(createdAt[lte]:"2022-01-01T00:00:00.000Z",idealCustomerProfile[eq]:true)))`,
    required: false,
    schema: {
      type: 'string',
    },
  };
};

export const computeLastCursorParameters = (item: ObjectMetadataEntity) => {
  return {
    name: 'last_cursor',
    in: 'query',
    description: `Used to return \`${item.namePlural}\` starting from a specific cursor`,
    required: false,
    schema: {
      type: 'string',
    },
  };
};

export const computeIdPathParameter = (item: ObjectMetadataEntity) => {
  return {
    name: 'id',
    in: 'path',
    description: `${capitalize(item.nameSingular)} id`,
    required: true,
    schema: {
      type: 'string',
      format: 'uuid',
    },
  };
};

const getManyResultResponse200 = (item: ObjectMetadataEntity) => {
  return {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                [item.namePlural]: {
                  type: 'object',
                  properties: {
                    edges: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          node: {
                            type: 'object',
                            properties: computeNodeProperties(item),
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          example: {
            data: {
              [item.namePlural]: {
                edges: [
                  {
                    node: computeNodeExample(item),
                  },
                ],
              },
            },
          },
        },
      },
    },
  };
};

const getErrorResponses = (description: string) => {
  return {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  };
};

export const computePath = (item: ObjectMetadataEntity) => {
  return {
    get: {
      tags: [item.namePlural],
      summary: `Find Many ${item.namePlural}`,
      description: `\`order_by\`, \`filter\`, \`limit\`, \`depth\` or \`last_cursor\` can be provided to request your \`${item.namePlural}\``,
      operationId: `findManyCompanies${capitalize(item.namePlural)}`,
      parameters: [
        computeOrderByParameters(item),
        computeFilterParameters(item),
        computeLimitParameters(item),
        computeDepthParameters(item),
        computeLastCursorParameters(item),
      ],
      responses: {
        '200': getManyResultResponse200(item),
        '400': getErrorResponses('Invalid request'),
        '401': getErrorResponses('Unauthorized'),
      },
    },
  };
};

const getSingleResultResponse200 = (item: ObjectMetadataEntity) => {
  return {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                [item.nameSingular]: {
                  type: 'object',
                  properties: computeNodeProperties(item),
                },
              },
            },
          },
          example: {
            data: {
              [item.nameSingular]: computeNodeExample(item),
            },
          },
        },
      },
    },
  };
};

const getDeleteResponse200 = (item) => {
  return {
    description: 'Successful operation',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                [item.nameSingular]: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                    },
                  },
                },
              },
            },
          },
          example: {
            data: {
              [item.nameSingular]: { id: 'id' },
            },
          },
        },
      },
    },
  };
};

export const computeSingleResultPath = (item: ObjectMetadataEntity) => {
  return {
    get: {
      tags: [item.namePlural],
      summary: `Find One ${item.nameSingular}`,
      description: `\`depth\` can be provided to request your \`${item.nameSingular}\``,
      operationId: `findOneCompany${capitalize(item.nameSingular)}`,
      parameters: [computeIdPathParameter(item), computeDepthParameters(item)],
      responses: {
        '200': getSingleResultResponse200(item),
        '400': getErrorResponses('Invalid request'),
        '401': getErrorResponses('Unauthorized'),
      },
    },
    delete: {
      tags: [item.namePlural],
      summary: `Delete One ${item.nameSingular}`,
      operationId: `deleteOneCompany${capitalize(item.nameSingular)}`,
      parameters: [computeIdPathParameter(item)],
      responses: {
        '200': getDeleteResponse200(item),
        '400': getErrorResponses('Invalid request'),
        '401': getErrorResponses('Unauthorized'),
      },
    },
  };
};
