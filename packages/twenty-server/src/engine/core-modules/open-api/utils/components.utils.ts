import { OpenAPIV3_1 } from 'openapi-types';
import { capitalize, FieldMetadataType } from 'twenty-shared';

import {
  computeDepthParameters,
  computeEndingBeforeParameters,
  computeFilterParameters,
  computeIdPathParameter,
  computeLimitParameters,
  computeOrderByParameters,
  computeStartingAfterParameters,
} from 'src/engine/core-modules/open-api/utils/parameters.utils';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

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

const getFieldProperties = (type: FieldMetadataType): Property => {
  switch (type) {
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
    case FieldMetadataType.NUMERIC:
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
      case FieldMetadataType.MULTI_SELECT:
        itemProperty = {
          type: 'array',
          items: {
            type: 'string',
            enum: field.options.map(
              (option: { value: string }) => option.value,
            ),
          },
        };
        break;
      case FieldMetadataType.SELECT:
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
        itemProperty = {
          type: 'object',
          properties: {
            primaryLinkLabel: {
              type: 'string',
            },
            primaryLinkUrl: {
              type: 'string',
            },
            secondaryLinks: {
              type: 'array',
              items: {
                type: 'object',
                description: 'A secondary link',
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri',
                  },
                  label: {
                    type: 'string',
                  },
                },
              },
            },
          },
        };
        break;
      case FieldMetadataType.CURRENCY:
        itemProperty = {
          type: 'object',
          properties: {
            amountMicros: {
              type: 'number',
            },
            currencyCode: {
              type: 'string',
            },
          },
        };
        break;
      case FieldMetadataType.FULL_NAME:
        itemProperty = {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
          },
        };
        break;
      case FieldMetadataType.ADDRESS:
        itemProperty = {
          type: 'object',
          properties: {
            addressStreet1: {
              type: 'string',
            },
            addressStreet2: {
              type: 'string',
            },
            addressCity: {
              type: 'string',
            },
            addressPostcode: {
              type: 'string',
            },
            addressState: {
              type: 'string',
            },
            addressCountry: {
              type: 'string',
            },
            addressLat: {
              type: 'number',
            },
            addressLng: {
              type: 'number',
            },
          },
        };
        break;
      case FieldMetadataType.ACTOR:
        itemProperty = {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: [
                'EMAIL',
                'CALENDAR',
                'WORKFLOW',
                'API',
                'IMPORT',
                'MANUAL',
                'SYSTEM',
              ],
            },
            ...(forResponse
              ? {
                  workspaceMemberId: {
                    type: 'string',
                    format: 'uuid',
                  },
                  name: {
                    type: 'string',
                  },
                }
              : {}),
          },
        };
        break;
      case FieldMetadataType.EMAILS:
        itemProperty = {
          type: 'object',
          properties: {
            primaryEmail: {
              type: 'string',
            },
            additionalEmails: {
              type: 'array',
              items: {
                type: 'string',
                format: 'email',
              },
            },
          },
        };
        break;
      case FieldMetadataType.PHONES:
        itemProperty = {
          properties: {
            additionalPhones: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            primaryPhoneCountryCode: {
              type: 'string',
            },
            primaryPhoneCallingCode: {
              type: 'string',
            },
            primaryPhoneNumber: {
              type: 'string',
            },
          },
          type: 'object',
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
          const baseFieldProperties = ({
            withImmutableFields,
            withRequiredFields,
          }: {
            withImmutableFields: boolean;
            withRequiredFields: boolean;
          }): OpenAPIV3_1.SchemaObject => ({
            type: 'object',
            description: `A field`,
            properties: {
              ...(withImmutableFields
                ? {
                    type: {
                      type: 'string',
                      enum: Object.keys(FieldMetadataType),
                    },
                    objectMetadataId: { type: 'string', format: 'uuid' },
                  }
                : {}),
              name: { type: 'string' },
              label: { type: 'string' },
              description: { type: 'string' },
              icon: { type: 'string' },
              defaultValue: {},
              isNullable: { type: 'boolean' },
              settings: { type: 'object' },
              options: {
                type: 'array',
                description: 'For enum field types like SELECT or MULTI_SELECT',
                items: {
                  type: 'object',
                  properties: {
                    color: { type: 'string' },
                    label: { type: 'string' },
                    value: {
                      type: 'string',
                      pattern: '^[A-Z0-9]+_[A-Z0-9]+$',
                      example: 'OPTION_1',
                    },
                    position: { type: 'number' },
                  },
                },
              },
            },
            ...(withRequiredFields
              ? { required: ['type', 'name', 'label', 'objectMetadataId'] }
              : {}),
          });

          schemas[`${capitalize(item.nameSingular)}`] = baseFieldProperties({
            withImmutableFields: true,
            withRequiredFields: true,
          });
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };
          schemas[`${capitalize(item.nameSingular)} for Update`] =
            baseFieldProperties({
              withImmutableFields: false,
              withRequiredFields: false,
            });
          schemas[`${capitalize(item.nameSingular)} for Response`] = {
            ...baseFieldProperties({
              withImmutableFields: true,
              withRequiredFields: false,
            }),
            properties: {
              ...schemas[`${capitalize(item.nameSingular)}`].properties,
              id: { type: 'string', format: 'uuid' },
              isCustom: { type: 'boolean' },
              isActive: { type: 'boolean' },
              isSystem: { type: 'boolean' },
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
