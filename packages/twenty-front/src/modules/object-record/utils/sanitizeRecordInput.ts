import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from '~/generated/graphql';

export const sanitizeRecordInput = ({
  objectMetadataItem,
  recordInput,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordInput: Record<string, unknown>;
}) => {
  return Object.fromEntries(
    Object.entries(recordInput).filter(([fieldName]) => {
      const fieldDefinition = objectMetadataItem.fields.find(
        (field) => field.name === fieldName,
      );

      return fieldDefinition?.type !== FieldMetadataType.Relation;
    }),
  );
};
