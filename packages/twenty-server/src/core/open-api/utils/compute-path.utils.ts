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

export const computePath = (item: ObjectMetadataEntity) => {
  return {
    get: {
      tags: [item.namePlural],
      summary: `Find Many ${item.namePlural}`,
      description: `order_by, filter, limit or last_cursor can be provided to request your ${item.namePlural}`,
      operationId: `findManyCompanies${capitalize(item.namePlural)}`,
      parameters: [
        {
          name: 'limit',
          in: 'query',
          description: `Integer value to limit the number of ${item.namePlural} returned`,
          required: false,
          schema: {
            type: 'integer',
            format: 'int64',
            minimum: 0,
            maximum: 60,
            default: 60,
          },
        },
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
