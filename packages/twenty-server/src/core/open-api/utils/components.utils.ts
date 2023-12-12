import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

type Property = {
  type: string;
  properties: Record<string, { type: string }>;
  items?: {
    type: string;
    properties: { node: { type: string } };
  };
};

type Properties = Record<string, Property>;

type Example = Record<string, string>;

type Required = string[];

type Schema = {
  type: string;
  example: Example;
  required?: Required;
  properties: Properties;
};

type SchemaComponents = Record<string, Schema>;

const getSchemaComponentsProperties = (
  item: ObjectMetadataEntity,
): Properties => {
  return item.fields.reduce((node, field) => {
    const itemProperty = {} as Property;

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
        itemProperty.type = 'array';
        itemProperty.items = {
          type: 'object',
          properties: {
            node: {
              type: 'object',
            },
          },
        };
        break;
      case FieldMetadataType.LINK:
      case FieldMetadataType.CURRENCY:
      case FieldMetadataType.FULL_NAME:
        itemProperty.type = 'object';
        itemProperty.properties = Object.keys(field.targetColumnMap).reduce(
          (properties, key) => {
            properties[key] = { type: 'string' };

            return properties;
          },
          {} as Record<string, { type: string }>,
        );
        break;
      default:
        itemProperty.type = 'string';
        break;
    }

    node[field.name] = itemProperty;

    return node;
  }, {} as Properties);
};

const getRequiredFields = (item: ObjectMetadataEntity): Required => {
  return item.fields.reduce((required, field) => {
    if (!field.isNullable && field.defaultValue === null) {
      required.push(field.name);

      return required;
    }

    return required;
  }, [] as Required);
};

const computeSchemaComponent = (item: ObjectMetadataEntity): Schema => {
  const result = {
    type: 'object',
    properties: getSchemaComponentsProperties(item),
    example: {},
  } as Schema;

  const requiredFields = getRequiredFields(item);

  if (requiredFields?.length) {
    result.required = requiredFields;
    result.example = requiredFields.reduce((example, requiredField) => {
      example[requiredField] = '';

      return example;
    }, {} as Example);
  }

  return result;
};

export const computeSchemaComponents = (
  objectMetadataItems: ObjectMetadataEntity[],
): SchemaComponents => {
  return objectMetadataItems.reduce((schemas, item) => {
    schemas[capitalize(item.nameSingular)] = computeSchemaComponent(item);

    return schemas;
  }, {});
};
