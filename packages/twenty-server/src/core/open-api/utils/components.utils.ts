import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export const computeSchemaComponents = (
  item: ObjectMetadataEntity,
): {
  type: string;
  required?: string[];
  properties: { [key: string]: { type: string; items: object } };
} => {
  const result = {
    type: 'object',
    properties: item.fields.reduce((node, field) => {
      const itemProperties = {
        type: 'string',
      };

      if (
        field.type === FieldMetadataType.NUMBER ||
        field.type === FieldMetadataType.NUMERIC ||
        field.type === FieldMetadataType.PROBABILITY ||
        field.type === FieldMetadataType.RATING
      ) {
        itemProperties.type = 'number';
      }

      if (field.type === FieldMetadataType.BOOLEAN) {
        itemProperties.type = 'boolean';
      }

      if (field.type === FieldMetadataType.RELATION) {
        itemProperties.type = 'array';
        itemProperties['items'] = {
          type: 'object',
          properties: {
            node: {
              type: 'object',
            },
          },
        };
      }

      if (Object.keys(field.targetColumnMap).length > 1) {
        itemProperties.type = 'object';
        itemProperties['properties'] = Object.keys(
          field.targetColumnMap,
        ).reduce((properties, key) => {
          properties[key] = { type: 'string' };

          return properties;
        }, {});
      }

      node[field.name] = itemProperties;

      return node;
    }, {}),
  };
  const requiredFields = item.fields.reduce((required: string[], field) => {
    if (!field.isNullable && field.defaultValue === null) {
      required.push(field.name);

      return required;
    }

    return required;
  }, []);

  if (requiredFields?.length) {
    result['required'] = requiredFields;
  }

  return result;
};
