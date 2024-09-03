import { OpenAPIV3_1 } from 'openapi-types';

import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';

import {
  computeDepthParameters,
  computeEndingBeforeParameters,
  computeFilterParameters,
  computeIdPathParameter,
  computeLimitParameters,
  computeOrderByParameters,
  computeStartingAfterParameters,
} from 'src/engine/core-modules/open-api/utils/parameters.utils';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

type Property = OpenAPIV3_1.SchemaObject;

type Properties = {
  [name: string]: Property;
};

const isFieldAvailable = (field: FieldMetadataEntity, forResponse: boolean) => {
  if (forResponse) {
    return true;
  }
  switch (field.name) {
    case 'id':
    case 'createdAt':
    case 'updatedAt':
    case 'deletedAt':
      return false;
    default:
      return true;
  }
};

const getFieldProperties = (
  type: FieldMetadataType,
  propertyName?: string,
  options?: FieldMetadataOptions,
): Property => {
  switch (type) {
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT:
      return {
        type: 'string',
        enum: options?.map((option: { value: string }) => option.value),
      };
    case FieldMetadataType.UUID:
      return { type: 'string', format: 'uuid' };
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONE:
    case FieldMetadataType.RICH_TEXT:
      return { type: 'string' };
    case FieldMetadataType.EMAIL:
      return { type: 'string', format: 'email' };
    case FieldMetadataType.DATE_TIME:
      return { type: 'string', format: 'date-time' };
    case FieldMetadataType.DATE:
      return { type: 'string', format: 'date' };
    case FieldMetadataType.NUMBER:
      return { type: 'integer' };
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.RATING:
    case FieldMetadataType.POSITION:
      return { type: 'number' };
    case FieldMetadataType.BOOLEAN:
      return { type: 'boolean' };
    case FieldMetadataType.RAW_JSON:
      if (propertyName === 'secondaryLinks') {
        return {
          type: 'array',
          items: {
            type: 'object',
            description: `A secondary link`,
            properties: {
              url: { type: 'string' },
              label: { type: 'string' },
            },
          },
        };
      }

      return { type: 'object' };

    default:
      return { type: 'string' };
  }
};

const getSchemaComponentsProperties = ({
  item,
  forResponse,
}: {
  item: ObjectMetadataEntity;
  forResponse: boolean;
}): Properties => {
  return item.fields.reduce((node, field) => {
    if (
      !isFieldAvailable(field, forResponse) ||
      field.type == FieldMetadataType.RELATION
    ) {
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
      case FieldMetadataType.ACTOR:
      case FieldMetadataType.EMAILS:
        itemProperty = {
          type: 'object',
          properties: compositeTypeDefinitions
            .get(field.type)
            ?.properties?.reduce((properties, property) => {
              if (
                property.hidden === true ||
                (property.hidden === 'input' && !forResponse) ||
                (property.hidden === 'output' && forResponse)
              ) {
                return properties;
              }
              properties[property.name] = getFieldProperties(
                property.type,
                property.name,
                property.options,
              );

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

const computeSchemaComponent = ({
  item,
  forResponse,
}: {
  item: ObjectMetadataEntity;
  forResponse: boolean;
}): OpenAPIV3_1.SchemaObject => {
  const result = {
    type: 'object',
    description: item.description,
    properties: getSchemaComponentsProperties({ item, forResponse }),
  } as OpenAPIV3_1.SchemaObject;

  if (forResponse) {
    return result;
  }

  const requiredFields = getRequiredFields(item);

  if (requiredFields?.length) {
    result.required = requiredFields;
  }

  return result;
};

const computeRelationSchemaComponent = ({
  item,
  forResponse,
}: {
  item: ObjectMetadataEntity;
  forResponse: boolean;
}): OpenAPIV3_1.SchemaObject => {
  const result = {
    description: item.description,
    allOf: [
      {
        $ref: `#/components/schemas/${capitalize(item.nameSingular)}${forResponse ? ' for Response' : ''}`,
      },
      {
        type: 'object',
        properties: getSchemaComponentsRelationProperties(item),
      },
    ],
  } as OpenAPIV3_1.SchemaObject;

  if (forResponse) {
    return result;
  }

  const requiredFields = getRequiredFields(item);

  if (requiredFields?.length) {
    result.required = requiredFields;
  }

  return result;
};

export const computeSchemaComponents = (
  objectMetadataItems: ObjectMetadataEntity[],
): Record<string, OpenAPIV3_1.SchemaObject> => {
  return objectMetadataItems.reduce(
    (schemas, item) => {
      schemas[capitalize(item.nameSingular)] = computeSchemaComponent({
        item,
        forResponse: false,
      });
      schemas[capitalize(item.nameSingular) + ' for Response'] =
        computeSchemaComponent({ item, forResponse: true });
      schemas[capitalize(item.nameSingular) + ' with Relations for Response'] =
        computeRelationSchemaComponent({ item, forResponse: true });

      return schemas;
    },
    {} as Record<string, OpenAPIV3_1.SchemaObject>,
  );
};

export const computeParameterComponents = (
  fromMetadata = false,
): Record<string, OpenAPIV3_1.ParameterObject> => {
  return {
    idPath: computeIdPathParameter(),
    startingAfter: computeStartingAfterParameters(),
    endingBefore: computeEndingBeforeParameters(),
    filter: computeFilterParameters(),
    depth: computeDepthParameters(),
    orderBy: computeOrderByParameters(),
    limit: computeLimitParameters(fromMetadata),
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
            description: `An object`,
            properties: {
              dataSourceId: { type: 'string', format: 'uuid' },
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
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              labelIdentifierFieldMetadataId: {
                type: 'string',
                format: 'uuid',
              },
              imageIdentifierFieldMetadataId: {
                type: 'string',
                format: 'uuid',
              },
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
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };

          return schemas;
        }
        case 'field': {
          schemas[`${capitalize(item.nameSingular)}`] = {
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
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              fromRelationMetadata: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  relationType: { type: 'string' },
                  toObjectMetadata: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      dataSourceId: { type: 'string', format: 'uuid' },
                      nameSingular: { type: 'string' },
                      namePlural: { type: 'string' },
                      isSystem: { type: 'boolean' },
                    },
                  },
                  toFieldMetadataId: { type: 'string', format: 'uuid' },
                },
              },
              toRelationMetadata: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  relationType: { type: 'string' },
                  fromObjectMetadata: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      dataSourceId: { type: 'string', format: 'uuid' },
                      nameSingular: { type: 'string' },
                      namePlural: { type: 'string' },
                      isSystem: { type: 'boolean' },
                    },
                  },
                  fromFieldMetadataId: { type: 'string', format: 'uuid' },
                },
              },
              defaultValue: { type: 'object' },
              options: { type: 'object' },
            },
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };

          return schemas;
        }
        case 'relation': {
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
            description: 'A relation',
            properties: {
              relationType: { type: 'string' },
              fromObjectMetadata: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  dataSourceId: { type: 'string', format: 'uuid' },
                  nameSingular: { type: 'string' },
                  namePlural: { type: 'string' },
                  isSystem: { type: 'boolean' },
                },
              },
              fromObjectMetadataId: { type: 'string' },
              toObjectMetadata: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  dataSourceId: { type: 'string', format: 'uuid' },
                  nameSingular: { type: 'string' },
                  namePlural: { type: 'string' },
                  isSystem: { type: 'boolean' },
                },
              },
              toObjectMetadataId: { type: 'string', format: 'uuid' },
              fromFieldMetadataId: { type: 'string', format: 'uuid' },
              toFieldMetadataId: { type: 'string', format: 'uuid' },
            },
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };
        }
      }

      return schemas;
    },
    {} as Record<string, OpenAPIV3_1.SchemaObject>,
  );
};
