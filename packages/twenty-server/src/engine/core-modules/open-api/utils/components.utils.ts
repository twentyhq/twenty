import { type OpenAPIV3_1 } from 'openapi-types';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { type FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { generateRandomFieldValue } from 'src/engine/core-modules/open-api/utils/generate-random-field-value.util';
import {
  computeDepthParameters,
  computeEndingBeforeParameters,
  computeFilterParameters,
  computeIdPathParameter,
  computeLimitParameters,
  computeOrderByParameters,
  computeStartingAfterParameters,
} from 'src/engine/core-modules/open-api/utils/parameters.utils';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { convertObjectMetadataToSchemaProperties } from 'src/engine/utils/convert-object-metadata-to-schema-properties.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';

type Property = OpenAPIV3_1.SchemaObject;

type Properties = {
  [name: string]: Property;
};

type OpenApiExample = Record<string, FieldMetadataDefaultValue>;

const getSchemaComponentsExample = (
  item: ObjectMetadataEntity,
): OpenApiExample => {
  return item.fields.reduce((node, field) => {
    // If field is required
    if (!field.isNullable && field.defaultValue === null) {
      return { ...node, [field.name]: generateRandomFieldValue({ field }) };
    }

    switch (field.type) {
      case FieldMetadataType.TEXT: {
        if (field.name !== 'name') {
          return node;
        }

        return {
          ...node,
          [field.name]: `${camelToTitleCase(item.nameSingular)} name`,
        };
      }

      case FieldMetadataType.EMAILS:
      case FieldMetadataType.LINKS:
      case FieldMetadataType.CURRENCY:
      case FieldMetadataType.FULL_NAME:
      case FieldMetadataType.SELECT:
      case FieldMetadataType.MULTI_SELECT:
      case FieldMetadataType.PHONES: {
        return {
          ...node,
          [field.name]: generateRandomFieldValue({ field }),
        };
      }

      default: {
        return node;
      }
    }
  }, {});
};

const getSchemaComponentsRelationProperties = (
  item: ObjectMetadataEntity,
): Properties => {
  return item.fields.reduce((node, field) => {
    if (field.type !== FieldMetadataType.RELATION) {
      return node;
    }

    let itemProperty = {} as Property;

    if (isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION)) {
      if (field.settings?.relationType === RelationType.MANY_TO_ONE) {
        itemProperty = {
          type: 'object',
          oneOf: [
            {
              $ref: `#/components/schemas/${capitalize(
                field.relationTargetObjectMetadata.nameSingular,
              )}ForResponse`,
            },
          ],
        };
      } else if (field.settings?.relationType === RelationType.ONE_TO_MANY) {
        itemProperty = {
          type: 'array',
          items: {
            $ref: `#/components/schemas/${capitalize(
              field.relationTargetObjectMetadata.nameSingular,
            )}ForResponse`,
          },
        };
      }
    }

    if (field.description) {
      itemProperty.description = field.description;
    }

    if (Object.keys(itemProperty).length) {
      return { ...node, [field.name]: itemProperty };
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
  forUpdate,
}: {
  item: ObjectMetadataEntity;
  forResponse: boolean;
  forUpdate: boolean;
}): OpenAPIV3_1.SchemaObject => {
  const withRelations = forResponse && !forUpdate;

  const withRequiredFields = !forResponse && !forUpdate;

  const result: OpenAPIV3_1.SchemaObject = {
    type: 'object',
    description: item.description ?? undefined,
    properties: convertObjectMetadataToSchemaProperties({
      item,
      forResponse,
    }) as Properties,
    ...(!forResponse ? { example: getSchemaComponentsExample(item) } : {}),
  };

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
        forResponse: false,
        forUpdate: false,
      });
      schemas[capitalize(item.nameSingular) + 'ForUpdate'] =
        computeSchemaComponent({
          item,
          forResponse: false,
          forUpdate: true,
        });
      schemas[capitalize(item.nameSingular) + 'ForResponse'] =
        computeSchemaComponent({
          item,
          forResponse: true,
          forUpdate: false,
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
          schemas[`${capitalize(item.nameSingular)}ForUpdate`] = {
            type: 'object',
            description: `An object`,
            properties: {
              isActive: { type: 'boolean' },
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForResponse`] = {
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
                          $ref: '#/components/schemas/FieldForResponse',
                        },
                      },
                    },
                  },
                },
              },
            },
          };
          schemas[`${capitalize(item.namePlural)}ForResponse`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}ForResponse`,
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
          schemas[`${capitalize(item.nameSingular)}ForUpdate`] =
            baseFieldProperties({
              withImmutableFields: false,
              withRequiredFields: false,
            });
          schemas[`${capitalize(item.nameSingular)}ForResponse`] = {
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
            },
          };
          schemas[`${capitalize(item.namePlural)}ForResponse`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}ForResponse`,
            },
          };

          return schemas;
        }
        case 'webhook': {
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
            description: `A webhook`,
            properties: {
              targetUrl: { type: 'string' },
              operations: {
                type: 'array',
                items: { type: 'string' },
                default: ['*.*'],
              },
              description: { type: 'string' },
              secret: { type: 'string' },
            },
            required: ['targetUrl'],
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForUpdate`] = {
            type: 'object',
            description: `A webhook for update`,
            properties: {
              targetUrl: { type: 'string' },
              operations: {
                type: 'array',
                items: { type: 'string' },
                default: [],
              },
              description: { type: 'string' },
              secret: { type: 'string' },
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForResponse`] = {
            type: 'object',
            description: `A webhook`,
            properties: {
              id: { type: 'string', format: 'uuid' },
              targetUrl: { type: 'string' },
              operations: {
                type: 'array',
                items: { type: 'string' },
              },
              description: { type: 'string' },
              secret: { type: 'string' },
              workspaceId: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: { type: 'string', format: 'date-time' },
            },
          };
          schemas[`${capitalize(item.namePlural)}ForResponse`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}ForResponse`,
            },
          };

          return schemas;
        }
        case 'apiKey': {
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
            description: `An API key`,
            properties: {
              name: { type: 'string' },
              expiresAt: { type: 'string', format: 'date-time' },
              roleId: { type: 'string', format: 'uuid' },
            },
            required: ['name', 'expiresAt', 'roleId'],
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForUpdate`] = {
            type: 'object',
            description: `An API key for update`,
            properties: {
              name: { type: 'string' },
              expiresAt: { type: 'string', format: 'date-time' },
              revokedAt: {
                type: 'string',
                format: 'date-time',
                description:
                  'Set to null to clear revocation. Defaults to null if not provided.',
              },
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForResponse`] = {
            type: 'object',
            description: `An API key`,
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              expiresAt: { type: 'string', format: 'date-time' },
              revokedAt: { type: 'string', format: 'date-time' },
              roleId: { type: 'string', format: 'uuid' },
              workspaceId: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          };
          schemas[`${capitalize(item.namePlural)}ForResponse`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}ForResponse`,
            },
          };

          return schemas;
        }
        case 'view': {
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
            description: `A view`,
            properties: {
              name: { type: 'string' },
              objectMetadataId: { type: 'string', format: 'uuid' },
              type: {
                type: 'string',
                enum: ['TABLE', 'KANBAN'],
                default: 'TABLE',
              },
              key: { type: 'string', default: 'INDEX' },
              icon: { type: 'string' },
              position: { type: 'number', default: 0 },
              isCompact: { type: 'boolean', default: false },
              openRecordIn: {
                type: 'string',
                enum: ['SIDE_PANEL', 'RECORD_PAGE'],
                default: 'SIDE_PANEL',
              },
              kanbanAggregateOperation: {
                type: 'string',
                enum: ['AVG', 'COUNT', 'MAX', 'MIN', 'SUM'],
              },
              kanbanAggregateOperationFieldMetadataId: {
                type: 'string',
                format: 'uuid',
              },
              anyFieldFilterValue: { type: 'string' },
            },
            required: ['name', 'objectMetadataId', 'icon'],
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForUpdate`] = {
            type: 'object',
            description: `A view for update`,
            properties: {
              name: { type: 'string' },
              type: {
                type: 'string',
                enum: ['TABLE', 'KANBAN'],
              },
              key: { type: 'string' },
              icon: { type: 'string' },
              position: { type: 'number' },
              isCompact: { type: 'boolean' },
              openRecordIn: {
                type: 'string',
                enum: ['SIDE_PANEL', 'RECORD_PAGE'],
              },
              kanbanAggregateOperation: {
                type: 'string',
                enum: ['AVG', 'COUNT', 'MAX', 'MIN', 'SUM'],
              },
              kanbanAggregateOperationFieldMetadataId: {
                type: 'string',
                format: 'uuid',
              },
              anyFieldFilterValue: { type: 'string' },
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForResponse`] = {
            type: 'object',
            description: `A view`,
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              objectMetadataId: { type: 'string', format: 'uuid' },
              type: {
                type: 'string',
                enum: ['TABLE', 'KANBAN'],
              },
              key: { type: 'string' },
              icon: { type: 'string' },
              position: { type: 'number' },
              isCompact: { type: 'boolean' },
              openRecordIn: {
                type: 'string',
                enum: ['SIDE_PANEL', 'RECORD_PAGE'],
              },
              kanbanAggregateOperation: {
                type: 'string',
                enum: ['AVG', 'COUNT', 'MAX', 'MIN', 'SUM'],
              },
              kanbanAggregateOperationFieldMetadataId: {
                type: 'string',
                format: 'uuid',
              },
              anyFieldFilterValue: { type: 'string' },
              workspaceId: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: { type: 'string', format: 'date-time' },
            },
          };
          schemas[`${capitalize(item.namePlural)}ForResponse`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}ForResponse`,
            },
          };

          return schemas;
        }
        case 'viewField': {
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
            description: `A view field`,
            properties: {
              fieldMetadataId: { type: 'string', format: 'uuid' },
              viewId: { type: 'string', format: 'uuid' },
              isVisible: { type: 'boolean', default: true },
              size: { type: 'number', default: 0 },
              position: { type: 'number', default: 0 },
              aggregateOperation: {
                type: 'string',
                enum: ['AVG', 'COUNT', 'MAX', 'MIN', 'SUM'],
              },
            },
            required: ['fieldMetadataId', 'viewId'],
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForUpdate`] = {
            type: 'object',
            description: `A view field for update`,
            properties: {
              isVisible: { type: 'boolean' },
              size: { type: 'number' },
              position: { type: 'number' },
              aggregateOperation: {
                type: 'string',
                enum: ['AVG', 'COUNT', 'MAX', 'MIN', 'SUM'],
              },
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForResponse`] = {
            type: 'object',
            description: `A view field`,
            properties: {
              id: { type: 'string', format: 'uuid' },
              fieldMetadataId: { type: 'string', format: 'uuid' },
              viewId: { type: 'string', format: 'uuid' },
              isVisible: { type: 'boolean' },
              size: { type: 'number' },
              position: { type: 'number' },
              aggregateOperation: {
                type: 'string',
                enum: ['AVG', 'COUNT', 'MAX', 'MIN', 'SUM'],
              },
              workspaceId: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: { type: 'string', format: 'date-time' },
            },
          };
          schemas[`${capitalize(item.namePlural)}ForResponse`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}ForResponse`,
            },
          };

          return schemas;
        }
        case 'viewFilter': {
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
            description: `A view filter`,
            properties: {
              fieldMetadataId: { type: 'string', format: 'uuid' },
              viewId: { type: 'string', format: 'uuid' },
              operand: {
                type: 'string',
                enum: [
                  'IS',
                  'IS_NOT_NULL',
                  'IS_NOT',
                  'LESS_THAN_OR_EQUAL',
                  'GREATER_THAN_OR_EQUAL',
                  'IS_BEFORE',
                  'IS_AFTER',
                  'CONTAINS',
                  'DOES_NOT_CONTAIN',
                  'IS_EMPTY',
                  'IS_NOT_EMPTY',
                  'IS_RELATIVE',
                  'IS_IN_PAST',
                  'IS_IN_FUTURE',
                  'IS_TODAY',
                  'VECTOR_SEARCH',
                ],
                default: 'CONTAINS',
              },
              value: {
                type: 'object',
                description: 'Filter value (JSON format)',
              },
              viewFilterGroupId: { type: 'string', format: 'uuid' },
              positionInViewFilterGroup: { type: 'number' },
              subFieldName: { type: 'string' },
            },
            required: ['fieldMetadataId', 'viewId', 'value'],
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForUpdate`] = {
            type: 'object',
            description: `A view filter for update`,
            properties: {
              operand: {
                type: 'string',
                enum: [
                  'IS',
                  'IS_NOT_NULL',
                  'IS_NOT',
                  'LESS_THAN_OR_EQUAL',
                  'GREATER_THAN_OR_EQUAL',
                  'IS_BEFORE',
                  'IS_AFTER',
                  'CONTAINS',
                  'DOES_NOT_CONTAIN',
                  'IS_EMPTY',
                  'IS_NOT_EMPTY',
                  'IS_RELATIVE',
                  'IS_IN_PAST',
                  'IS_IN_FUTURE',
                  'IS_TODAY',
                  'VECTOR_SEARCH',
                ],
              },
              value: {
                type: 'object',
                description: 'Filter value (JSON format)',
              },
              viewFilterGroupId: { type: 'string', format: 'uuid' },
              positionInViewFilterGroup: { type: 'number' },
              subFieldName: { type: 'string' },
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForResponse`] = {
            type: 'object',
            description: `A view filter`,
            properties: {
              id: { type: 'string', format: 'uuid' },
              fieldMetadataId: { type: 'string', format: 'uuid' },
              viewId: { type: 'string', format: 'uuid' },
              operand: {
                type: 'string',
                enum: [
                  'IS',
                  'IS_NOT_NULL',
                  'IS_NOT',
                  'LESS_THAN_OR_EQUAL',
                  'GREATER_THAN_OR_EQUAL',
                  'IS_BEFORE',
                  'IS_AFTER',
                  'CONTAINS',
                  'DOES_NOT_CONTAIN',
                  'IS_EMPTY',
                  'IS_NOT_EMPTY',
                  'IS_RELATIVE',
                  'IS_IN_PAST',
                  'IS_IN_FUTURE',
                  'IS_TODAY',
                  'VECTOR_SEARCH',
                ],
              },
              value: {
                type: 'object',
                description: 'Filter value (JSON format)',
              },
              viewFilterGroupId: { type: 'string', format: 'uuid' },
              positionInViewFilterGroup: { type: 'number' },
              subFieldName: { type: 'string' },
              workspaceId: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: { type: 'string', format: 'date-time' },
            },
          };
          schemas[`${capitalize(item.namePlural)}ForResponse`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}ForResponse`,
            },
          };

          return schemas;
        }
        case 'viewSort': {
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
            description: `A view sort`,
            properties: {
              fieldMetadataId: { type: 'string', format: 'uuid' },
              viewId: { type: 'string', format: 'uuid' },
              direction: {
                type: 'string',
                enum: ['ASC', 'DESC'],
                default: 'ASC',
              },
            },
            required: ['fieldMetadataId', 'viewId'],
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForUpdate`] = {
            type: 'object',
            description: `A view sort for update`,
            properties: {
              direction: {
                type: 'string',
                enum: ['ASC', 'DESC'],
              },
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForResponse`] = {
            type: 'object',
            description: `A view sort`,
            properties: {
              id: { type: 'string', format: 'uuid' },
              fieldMetadataId: { type: 'string', format: 'uuid' },
              viewId: { type: 'string', format: 'uuid' },
              direction: {
                type: 'string',
                enum: ['ASC', 'DESC'],
              },
              workspaceId: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: { type: 'string', format: 'date-time' },
            },
          };
          schemas[`${capitalize(item.namePlural)}ForResponse`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}ForResponse`,
            },
          };

          return schemas;
        }
        case 'viewGroup': {
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
            description: `A view group`,
            properties: {
              fieldMetadataId: { type: 'string', format: 'uuid' },
              viewId: { type: 'string', format: 'uuid' },
              fieldValue: { type: 'string' },
              isVisible: { type: 'boolean', default: true },
              position: { type: 'number', default: 0 },
            },
            required: ['fieldMetadataId', 'viewId', 'fieldValue'],
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForUpdate`] = {
            type: 'object',
            description: `A view group for update`,
            properties: {
              fieldValue: { type: 'string' },
              isVisible: { type: 'boolean' },
              position: { type: 'number' },
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForResponse`] = {
            type: 'object',
            description: `A view group`,
            properties: {
              id: { type: 'string', format: 'uuid' },
              fieldMetadataId: { type: 'string', format: 'uuid' },
              viewId: { type: 'string', format: 'uuid' },
              fieldValue: { type: 'string' },
              isVisible: { type: 'boolean' },
              position: { type: 'number' },
              workspaceId: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: { type: 'string', format: 'date-time' },
            },
          };
          schemas[`${capitalize(item.namePlural)}ForResponse`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}ForResponse`,
            },
          };

          return schemas;
        }
        case 'viewFilterGroup': {
          schemas[`${capitalize(item.nameSingular)}`] = {
            type: 'object',
            description: `A view filter group`,
            properties: {
              viewId: { type: 'string', format: 'uuid' },
              parentViewFilterGroupId: { type: 'string', format: 'uuid' },
              logicalOperator: {
                type: 'string',
                enum: ['AND', 'OR', 'NOT'],
                default: 'AND',
              },
              positionInViewFilterGroup: { type: 'number' },
            },
            required: ['viewId'],
          };
          schemas[`${capitalize(item.namePlural)}`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForUpdate`] = {
            type: 'object',
            description: `A view filter group for update`,
            properties: {
              parentViewFilterGroupId: { type: 'string', format: 'uuid' },
              logicalOperator: {
                type: 'string',
                enum: ['AND', 'OR', 'NOT'],
              },
              positionInViewFilterGroup: { type: 'number' },
            },
          };
          schemas[`${capitalize(item.nameSingular)}ForResponse`] = {
            type: 'object',
            description: `A view filter group`,
            properties: {
              id: { type: 'string', format: 'uuid' },
              viewId: { type: 'string', format: 'uuid' },
              parentViewFilterGroupId: { type: 'string', format: 'uuid' },
              logicalOperator: {
                type: 'string',
                enum: ['AND', 'OR', 'NOT'],
              },
              positionInViewFilterGroup: { type: 'number' },
              workspaceId: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: { type: 'string', format: 'date-time' },
            },
          };
          schemas[`${capitalize(item.namePlural)}ForResponse`] = {
            type: 'array',
            description: `A list of ${item.namePlural}`,
            items: {
              $ref: `#/components/schemas/${capitalize(item.nameSingular)}ForResponse`,
            },
          };

          return schemas;
        }
      }

      return schemas;
    },
    {} as Record<string, OpenAPIV3_1.SchemaObject>,
  );
};
