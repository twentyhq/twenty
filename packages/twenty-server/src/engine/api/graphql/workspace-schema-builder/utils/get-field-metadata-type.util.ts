import { FieldMetadataType } from 'twenty-shared';

const typeOrmTypeMapping = new Map<string, FieldMetadataType>([
  ['uuid', FieldMetadataType.UUID],
  ['timestamptz', FieldMetadataType.DATE_TIME],
  // Add more types here if we need to support more than id, and createdAt/updatedAt/deletedAt
]);

export const getFieldMetadataType = (type: string) => {
  const fieldType = typeOrmTypeMapping.get(type);

  if (fieldType === undefined || fieldType === null) {
    throw new Error(`Unknown type ${type}`);
  }

  return fieldType;
};
