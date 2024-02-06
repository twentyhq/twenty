import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateObjectRecordSchema } from '@/object-record/utils/generateObjectRecordSchema';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const sanitizeRecordInput = ({
  objectMetadataItem,
  recordInput,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordInput: Record<string, unknown>;
}) => {
  const fieldNames = objectMetadataItem.fields.map(({ name }) => name);
  // Add relation id fields
  const relationIdFields = Object.entries(recordInput).reduce<
    Record<string, string | null>
  >((result, [fieldName, fieldValue]) => {
    const relationIdFieldName = `${fieldName}Id`;

    if (!fieldNames.includes(relationIdFieldName)) return result;

    const relationRecord = fieldValue as ObjectRecord | null;
    const relationRecordId = relationRecord?.id ?? null;

    return { ...result, [relationIdFieldName]: relationRecordId };
  }, {});

  const recordSchema = generateObjectRecordSchema({
    objectMetadataItem,
    objectMetadataItems: [],
  });

  const validation = recordSchema
    .partial()
    // Omit relation fields
    .omit(
      Object.fromEntries(
        objectMetadataItem.fields
          .filter(({ type }) => type === FieldMetadataType.Relation)
          .map(({ name }) => [name, true]),
      ),
    )
    .safeParse({
      ...recordInput,
      ...relationIdFields,
    });

  return validation.success ? validation.data : {};
};
