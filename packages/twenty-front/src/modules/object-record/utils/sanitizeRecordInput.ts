import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldRelationValue } from '@/object-record/record-field/types/guards/isFieldRelationValue';
import { FieldMetadataType } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const sanitizeRecordInput = ({
  objectMetadataItem,
  recordInput,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordInput: Record<string, unknown>;
}) => {
  return Object.fromEntries(
    Object.entries(recordInput)
      .map<[string, unknown] | undefined>(([fieldName, fieldValue]) => {
        const fieldMetadataItem = objectMetadataItem.fields.find(
          (field) => field.name === fieldName,
        );

        if (!fieldMetadataItem) return undefined;

        if (
          fieldMetadataItem.type === FieldMetadataType.Relation &&
          isFieldRelationValue(fieldValue)
        ) {
          const relationIdFieldName = `${fieldMetadataItem.name}Id`;
          const relationIdFieldMetadataItem = objectMetadataItem.fields.find(
            (field) => field.name === relationIdFieldName,
          );

          return relationIdFieldMetadataItem
            ? [relationIdFieldName, fieldValue?.id ?? null]
            : undefined;
        }

        return [fieldName, fieldValue];
      })
      .filter(isDefined),
  );
};
