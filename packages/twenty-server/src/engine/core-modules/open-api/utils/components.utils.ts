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
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
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
    case FieldMetadataType.RICH_TEXT:
      return { type: 'string' };
    case FieldMetadataType.DATE_TIME:
      return { type: 'string', format: 'date-time' };
    case FieldMetadataType.DATE:
      return { type: 'string', format: 'date' };
    case FieldMetadataType.NUMBER:
      return { type: 'integer' };
    case FieldMetadataType.RATING:
      return {
        type: 'string',
        enum: options?.map((option: { value: string }) => option.value),
      };
    case FieldMetadataType.NUMERIC:
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
      field.type === FieldMetadataType.RELATION ||
      field.type === FieldMetadataType.TS_VECTOR
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
      case FieldMetadataType.ARRAY:
        itemProperty = {
          type: 'array',
          items: {
            type: 'string',
          },
        };
        break;
      case FieldMetadataType.RATING:
        itemProperty = {
          type: 'string',
          enum: field.options.map((option: { value: string }) => option.value),
        };
        break;
      case FieldMetadataType.LINKS:
      case FieldMetadataType.CURRENCY:
      case FieldMetadataType.FULL_NAME:
      case FieldMetadataType.ADDRESS:
      case FieldMetadataType.ACTOR:
      case FieldMetadataType.EMAILS:
      case FieldMetadataType.PHONES:
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
    if (field.type !== FieldMetadataType.RELATION) {
      return node;
    }

    let itemProperty = {} as Property;

    if (field.fromRelationMetadata?.toObjectMetadata.nameSingular) {
      itemProperty = {
        type: 'array',
        items: {
          $ref: `#/components/schemas/${capitalize(
            field.fromRelationMetadata?.toObjectMetadata.nameSingular,
          )} for Response`,
        },
      };
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
  withRequiredFields,
  forResponse,
  withRelations,
}: {
  item: ObjectMetadataEntity;
  withRequiredFields: boolean;
  forResponse: boolean;
  withRelations: boolean;
}): OpenAPIV3_1.SchemaObject => {
  const result = {
    type: 'object',
    description: item.description,
    properties: getSchemaComponentsProperties({ item, forResponse }),
  } as OpenAPIV3_1.SchemaObject;

  if (withRelations) {
    result.properties = {
      ...result.properties,
      ...getSchemaComponentsRelationProperties(item),
    };
  }

  if (!withRequiredFields) {
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
        withRequiredFields: true,
        forResponse: false,
        withRelations: false,
      });
      schemas[capitalize(item.nameSingular) + ' for Update'] =
        computeSchemaComponent({
          item,
          withRequiredFields: false,
          forResponse: false,
          withRelations: false,
        });
      schemas[capitalize(item.nameSingular) + ' for Response'] =
        computeSchemaComponent({
          item,
          withRequiredFields: false,
          forResponse: true,
          withRelations: true,
        });

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
              nameSingular: { type: 'string' },
              namePlural: { type: 'string' },
              labelSingular: { type: 'string' },
              labelPlural: { type: 'string' },
              description: { type: 'string' },
              icon: { type: 'string' },
              labelIdentifierFieldMetadataId: {
                type: 'string',
                format: 'uuid',
              },
              imageIdentifierFieldMetadataId: {
                type: 'string',
                format: 'uuid',
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
          schemas[`${capitalize(item.nameSingular)} for Update`] = {
            type: 'object',
            description: `An object`,
            properties: {
              isActive: { type: 'boolean' },
            },
          };
          schemas[`${capitalize(item.nameSingular)} for Response`] = {
            ...schemas[`${capitalize(item.nameSingular)}`],
            properties: {
              ...schemas[`${capitalize(item.nameSingular)}`].properties,
              id: { type: 'string', format: 'uuid' },
              dataSourceId: { type: 'string', format: 'uuid' },
              isCustom: { type: 'boolean' },
              isActive: { type: 'boolean' },
              isSystem: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              fields: {
                type: 'object',
                properties: {
                  edges: {
                    type: 'object',
                    properties: {
                      node: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Field for Response',
                        },
                      },
                    },
                  },
                },
              },
            },
          };
          schemas[`${capitalize(item.namePlural)} for Response`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)} for Response`,
            },
          };

          return schemas;
        }
        case 'field': {
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
            description: `A field`,
            properties: {
              type: {
                type: 'string',
                enum: Object.keys(FieldMetadataType),
              },
              name: { type: 'string' },
              label: { type: 'string' },
              description: { type: 'string' },
              icon: { type: 'string' },
              isNullable: { type: 'boolean' },
              objectMetadataId: { type: 'string', format: 'uuid' },
            },
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };
          schemas[`${capitalize(item.nameSingular)} for Update`] = {
            type: 'object',
            description: `An object`,
            properties: {
              description: { type: 'string' },
              icon: { type: 'string' },
              isActive: { type: 'boolean' },
              isCustom: { type: 'boolean' },
              isNullable: { type: 'boolean' },
              isSystem: { type: 'boolean' },
              label: { type: 'string' },
              name: { type: 'string' },
            },
          };
          schemas[`${capitalize(item.nameSingular)} for Response`] = {
            ...schemas[`${capitalize(item.nameSingular)}`],
            properties: {
              type: {
                type: 'string',
                enum: Object.keys(FieldMetadataType),
              },
              name: { type: 'string' },
              label: { type: 'string' },
              description: { type: 'string' },
              icon: { type: 'string' },
              isNullable: { type: 'boolean' },
              id: { type: 'string', format: 'uuid' },
              isCustom: { type: 'boolean' },
              isActive: { type: 'boolean' },
              isSystem: { type: 'boolean' },
              defaultValue: { type: 'object' },
              options: { type: 'object' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              fromRelationMetadata: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  relationType: {
                    type: 'string',
                    enum: Object.keys(RelationMetadataType),
                  },
                  toObjectMetadata: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      dataSourceId: { type: 'string', format: 'uuid' },
                      nameSingular: { type: 'string' },
                      namePlural: { type: 'string' },
                      isSystem: { type: 'boolean' },
                      isRemote: { type: 'boolean' },
                    },
                  },
                  toFieldMetadataId: { type: 'string', format: 'uuid' },
                },
              },
              toRelationMetadata: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  relationType: {
                    type: 'string',
                    enum: Object.keys(RelationMetadataType),
                  },
                  fromObjectMetadata: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      dataSourceId: { type: 'string', format: 'uuid' },
                      nameSingular: { type: 'string' },
                      namePlural: { type: 'string' },
                      isSystem: { type: 'boolean' },
                      isRemote: { type: 'boolean' },
                    },
                  },
                  fromFieldMetadataId: { type: 'string', format: 'uuid' },
                },
              },
            },
          };
          schemas[`${capitalize(item.namePlural)} for Response`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)} for Response`,
            },
          };

          return schemas;
        }
        case 'relation': {
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
            description: 'A relation',
            properties: {
              relationType: {
                type: 'string',
                enum: Object.keys(RelationMetadataType),
              },
              fromObjectMetadataId: { type: 'string', format: 'uuid' },
              toObjectMetadataId: { type: 'string', format: 'uuid' },
              fromName: { type: 'string' },
              fromLabel: { type: 'string' },
              toName: { type: 'string' },
              toLabel: { type: 'string' },
            },
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };
          schemas[`${capitalize(item.nameSingular)} for Response`] = {
            ...schemas[`${capitalize(item.nameSingular)}`],
            properties: {
              relationType: {
                type: 'string',
                enum: Object.keys(RelationMetadataType),
              },
              id: { type: 'string', format: 'uuid' },
              fromFieldMetadataId: { type: 'string', format: 'uuid' },
              toFieldMetadataId: { type: 'string', format: 'uuid' },
              fromObjectMetadata: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  dataSourceId: { type: 'string', format: 'uuid' },
                  nameSingular: { type: 'string' },
                  namePlural: { type: 'string' },
                  isSystem: { type: 'boolean' },
                  isRemote: { type: 'boolean' },
                },
              },
              toObjectMetadata: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  dataSourceId: { type: 'string', format: 'uuid' },
                  nameSingular: { type: 'string' },
                  namePlural: { type: 'string' },
                  isSystem: { type: 'boolean' },
                  isRemote: { type: 'boolean' },
                },
              },
            },
          };
          schemas[`${capitalize(item.namePlural)} for Response`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)} for Response`,
            },
          };
        }
      }

      return schemas;
    },
    {} as Record<string, OpenAPIV3_1.SchemaObject>,
  );
};
