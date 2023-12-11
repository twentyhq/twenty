import { OrderByDirection } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

import { capitalize } from 'src/utils/capitalize';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

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
    description: `A combination of fields, filter operations and values to filter \`${item.namePlural}\` returned`,
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
        '200': {
          description: 'successful operation',
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
        },
      },
    },
  };
};
