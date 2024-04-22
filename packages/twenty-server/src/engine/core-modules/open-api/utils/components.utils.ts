import { OpenAPIV3_1 } from 'openapi-types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { capitalize } from 'src/utils/capitalize';
import {
  computeDepthParameters,
  computeFilterParameters,
  computeIdPathParameter,
  computeLastCursorParameters,
  computeLimitParameters,
  computeOrderByParameters,
} from 'src/engine/core-modules/open-api/utils/parameters.utils';
import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';

type Property = OpenAPIV3_1.SchemaObject;

type Properties = {
  [name: string]: Property;
};

const getSchemaComponentsProperties = (
  item: ObjectMetadataEntity,
): Properties => {
  return item.fields.reduce((node, field) => {
    let itemProperty = {} as Property;

    switch (field.type) {
      case FieldMetadataType.UUID:
      case FieldMetadataType.TEXT:
      case FieldMetadataType.PHONE:
      case FieldMetadataType.EMAIL:
      case FieldMetadataType.DATE_TIME:
      case FieldMetadataType.DATE:
        itemProperty.type = 'string';
        break;
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
      case FieldMetadataType.PROBABILITY:
      case FieldMetadataType.RATING:
      case FieldMetadataType.POSITION:
        itemProperty.type = 'number';
        break;
      case FieldMetadataType.BOOLEAN:
        itemProperty.type = 'boolean';
        break;
      case FieldMetadataType.RELATION:
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
        break;
      case FieldMetadataType.LINK:
      case FieldMetadataType.CURRENCY:
      case FieldMetadataType.FULL_NAME:
      case FieldMetadataType.ADDRESS:
      case FieldMetadataType.FILE:
        itemProperty = {
          type: 'object',
          properties: compositeTypeDefintions
            .get(field.type)
            ?.properties?.reduce((properties, property) => {
              // TODO: This should not be statically typed, instead we should do someting recursive
              properties[property.name] = { type: 'string' };

              return properties;
            }, {} as Properties),
        };
        break;
      case FieldMetadataType.RAW_JSON:
        itemProperty.type = 'object';
        break;
      default:
        itemProperty.type = 'string';
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

export const computeSchemaComponents = (
  objectMetadataItems: ObjectMetadataEntity[],
): Record<string, OpenAPIV3_1.SchemaObject> => {
  return objectMetadataItems.reduce(
    (schemas, item) => {
      schemas[capitalize(item.nameSingular)] = computeSchemaComponent(item);

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
    lastCursor: computeLastCursorParameters(),
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
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
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
          };

          return schemas;
        }
        case 'field': {
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
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
          };

          return schemas;
        }
        case 'relation': {
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
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
          };
        }
      }

      return schemas;
    },
    {} as Record<string, OpenAPIV3_1.SchemaObject>,
  );
};
