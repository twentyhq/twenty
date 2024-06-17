import { OpenAPIV3_1 } from 'openapi-types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { capitalize } from 'src/utils/capitalize';
import {
  computeDepthParameters,
  computeEndingBeforeParameters,
  computeFilterParameters,
  computeIdPathParameter,
  computeLimitParameters,
  computeOrderByParameters,
  computeStartingAfterParameters,
} from 'src/engine/core-modules/open-api/utils/parameters.utils';
import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';

type Property = OpenAPIV3_1.SchemaObject;

type Properties = {
  [name: string]: Property;
};

const getFieldProperties = (type: FieldMetadataType): Property => {
  switch (type) {
    case FieldMetadataType.UUID:
      return { type: 'string', format: 'uuid' };
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONE:
      return { type: 'string' };
    case FieldMetadataType.EMAIL:
      return { type: 'string', format: 'email' };
    case FieldMetadataType.DATE_TIME:
    case FieldMetadataType.DATE:
      return { type: 'string', format: 'date' };
    case FieldMetadataType.NUMBER:
      return { type: 'integer' };
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.PROBABILITY:
    case FieldMetadataType.RATING:
    case FieldMetadataType.POSITION:
      return { type: 'number' };
    case FieldMetadataType.BOOLEAN:
      return { type: 'boolean' };
    case FieldMetadataType.RAW_JSON:
      return { type: 'object' };
    default:
      return { type: 'string' };
  }
};

const getSchemaComponentsProperties = (
  item: ObjectMetadataEntity,
): Properties => {
  return item.fields.reduce((node, field) => {
    if (field.type == FieldMetadataType.RELATION) {
      return node;
    }

    let itemProperty = {} as Property;

    switch (field.type) {
      case FieldMetadataType.SELECT:
      case FieldMetadataType.MULTI_SELECT:
        itemProperty = {
          type: 'string',
          enum: field.options.map((option: { value: string }) => option.value),
        };
        break;
      case FieldMetadataType.LINK:
      case FieldMetadataType.LINKS:
      case FieldMetadataType.CURRENCY:
      case FieldMetadataType.FULL_NAME:
      case FieldMetadataType.ADDRESS:
        itemProperty = {
          type: 'object',
          properties: compositeTypeDefintions
            .get(field.type)
            ?.properties?.reduce((properties, property) => {
              properties[property.name] = getFieldProperties(property.type);

              return properties;
            }, {} as Properties),
        };
        break;
      default:
        itemProperty = getFieldProperties(field.type);
        break;
    }

    if (field.description) {
      itemProperty.description = field.description;
    }

    if (Object.keys(itemProperty).length) {
      node[field.name] = itemProperty;
    }

    return node;
  }, {} as Properties);
};

const getSchemaComponentsRelationProperties = (
  item: ObjectMetadataEntity,
): Properties => {
  return item.fields.reduce((node, field) => {
    let itemProperty = {} as Property;

    if (field.type == FieldMetadataType.RELATION) {
      if (field.fromRelationMetadata?.toObjectMetadata.nameSingular) {
        itemProperty = {
          type: 'array',
          items: {
            $ref: `#/components/schemas/${capitalize(
              field.fromRelationMetadata?.toObjectMetadata.nameSingular || '',
            )}`,
          },
        };
      }
    }

    if (field.description) {
      itemProperty.description = field.description;
    }

    if (Object.keys(itemProperty).length) {
      node[field.name] = itemProperty;
    }

    return node;
  }, {} as Properties);
};

const getRequiredFields = (item: ObjectMetadataEntity): string[] => {
  return item.fields.reduce((required, field) => {
    if (!field.isNullable && field.defaultValue === null) {
      required.push(field.name);

      return required;
    }

    return required;
  }, [] as string[]);
};

const computeSchemaComponent = (
  item: ObjectMetadataEntity,
): OpenAPIV3_1.SchemaObject => {
  const result = {
    type: 'object',
    description: item.description,
    properties: getSchemaComponentsProperties(item),
    example: {},
  } as OpenAPIV3_1.SchemaObject;

  const requiredFields = getRequiredFields(item);

  if (requiredFields?.length) {
    result.required = requiredFields;
    result.example = requiredFields.reduce(
      (example, requiredField) => {
        example[requiredField] = '';

        return example;
      },
      {} as Record<string, string>,
    );
  }

  return result;
};

const computeRelationSchemaComponent = (
  item: ObjectMetadataEntity,
): OpenAPIV3_1.SchemaObject => {
  const result = {
    description: item.description,
    allOf: [
      {
        $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
      },
      {
        type: 'object',
        properties: getSchemaComponentsRelationProperties(item),
      },
    ],
    example: {},
  } as OpenAPIV3_1.SchemaObject;

  const requiredFields = getRequiredFields(item);

  if (requiredFields?.length) {
    result.required = requiredFields;
    result.example = requiredFields.reduce(
      (example, requiredField) => {
        example[requiredField] = '';

        return example;
      },
      {} as Record<string, string>,
    );
  }

  return result;
};

export const computeSchemaComponents = (
  objectMetadataItems: ObjectMetadataEntity[],
): Record<string, OpenAPIV3_1.SchemaObject> => {
  return objectMetadataItems.reduce(
    (schemas, item) => {
      schemas[capitalize(item.nameSingular)] = computeSchemaComponent(item);
      schemas[capitalize(item.nameSingular) + ' with Relations'] =
        computeRelationSchemaComponent(item);

      return schemas;
    },
    {} as Record<string, OpenAPIV3_1.SchemaObject>,
  );
};

export const computeParameterComponents = (): Record<
  string,
  OpenAPIV3_1.ParameterObject
> => {
  return {
    idPath: computeIdPathParameter(),
    startingAfter: computeStartingAfterParameters(),
    endingBefore: computeEndingBeforeParameters(),
    filter: computeFilterParameters(),
    depth: computeDepthParameters(),
    orderBy: computeOrderByParameters(),
    limit: computeLimitParameters(),
  };
};

export const computeMetadataSchemaComponents = (
  metadataSchema: { nameSingular: string; namePlural: string }[],
): Record<string, OpenAPIV3_1.SchemaObject> => {
  return metadataSchema.reduce(
    (schemas, item) => {
      switch (item.nameSingular) {
        case 'object': {
          schemas[`${capitalize(item.nameSingular)} with Relations`] = {
            type: 'object',
            description: `An object`,
            properties: {
              dataSourceId: { type: 'string' },
              nameSingular: { type: 'string' },
              namePlural: { type: 'string' },
              labelSingular: { type: 'string' },
              labelPlural: { type: 'string' },
              description: { type: 'string' },
              icon: { type: 'string' },
              isCustom: { type: 'boolean' },
              isRemote: { type: 'boolean' },
              isActive: { type: 'boolean' },
              isSystem: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              labelIdentifierFieldMetadataId: { type: 'string' },
              imageIdentifierFieldMetadataId: { type: 'string' },
              fields: {
                type: 'object',
                properties: {
                  edges: {
                    type: 'object',
                    properties: {
                      node: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Field',
                        },
                      },
                    },
                  },
                },
              },
            },
            example: {},
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
            example: [{}],
          };

          return schemas;
        }
        case 'field': {
          schemas[`${capitalize(item.nameSingular)} with Relations`] = {
            type: 'object',
            description: `A field`,
            properties: {
              type: { type: 'string' },
              name: { type: 'string' },
              label: { type: 'string' },
              description: { type: 'string' },
              icon: { type: 'string' },
              isCustom: { type: 'boolean' },
              isActive: { type: 'boolean' },
              isSystem: { type: 'boolean' },
              isNullable: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              fromRelationMetadata: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  relationType: { type: 'string' },
                  toObjectMetadata: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      dataSourceId: { type: 'string' },
                      nameSingular: { type: 'string' },
                      namePlural: { type: 'string' },
                      isSystem: { type: 'boolean' },
                    },
                  },
                  toFieldMetadataId: { type: 'string' },
                },
              },
              toRelationMetadata: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  relationType: { type: 'string' },
                  fromObjectMetadata: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      dataSourceId: { type: 'string' },
                      nameSingular: { type: 'string' },
                      namePlural: { type: 'string' },
                      isSystem: { type: 'boolean' },
                    },
                  },
                  fromFieldMetadataId: { type: 'string' },
                },
              },
              defaultValue: { type: 'object' },
              options: { type: 'object' },
            },
            example: {},
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
            example: [{}],
          };

          return schemas;
        }
        case 'relation': {
          schemas[`${capitalize(item.nameSingular)} with Relations`] = {
            type: 'object',
            description: 'A relation',
            properties: {
              relationType: { type: 'string' },
              fromObjectMetadata: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  dataSourceId: { type: 'string' },
                  nameSingular: { type: 'string' },
                  namePlural: { type: 'string' },
                  isSystem: { type: 'boolean' },
                },
              },
              fromObjectMetadataId: { type: 'string' },
              toObjectMetadata: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  dataSourceId: { type: 'string' },
                  nameSingular: { type: 'string' },
                  namePlural: { type: 'string' },
                  isSystem: { type: 'boolean' },
                },
              },
              toObjectMetadataId: { type: 'string' },
              fromFieldMetadataId: { type: 'string' },
              toFieldMetadataId: { type: 'string' },
            },
            example: {},
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
            example: [{}],
          };
        }
      }

      return schemas;
    },
    {} as Record<string, OpenAPIV3_1.SchemaObject>,
  );
};
