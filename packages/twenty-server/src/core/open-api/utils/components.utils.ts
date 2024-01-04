import { OpenAPIV3 } from 'openapi-types';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { capitalize } from 'src/utils/capitalize';
import {
  computeDepthParameters,
  computeFilterParameters,
  computeIdPathParameter,
  computeLastCursorParameters,
  computeLimitParameters,
  computeOrderByParameters,
} from 'src/core/open-api/utils/parameters.utils';

type Property = OpenAPIV3.SchemaObject;

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
        itemProperty.type = 'string';
        break;
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
      case FieldMetadataType.PROBABILITY:
      case FieldMetadataType.RATING:
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
        itemProperty = {
          type: 'object',
          properties: Object.keys(field.targetColumnMap).reduce(
            (properties, key) => {
              properties[key] = { type: 'string' };

              return properties;
            },
            {} as Properties,
          ),
        };
        break;
      default:
        itemProperty.type = 'string';
        break;
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
): OpenAPIV3.SchemaObject => {
  const result = {
    type: 'object',
    properties: getSchemaComponentsProperties(item),
    example: {},
  } as OpenAPIV3.SchemaObject;

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
): Record<string, OpenAPIV3.SchemaObject> => {
  return objectMetadataItems.reduce(
    (schemas, item) => {
      schemas[capitalize(item.nameSingular)] = computeSchemaComponent(item);

      return schemas;
    },
    {} as Record<string, OpenAPIV3.SchemaObject>,
  );
};

export const computeParameterComponents = (): Record<
  string,
  OpenAPIV3.ParameterObject
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
