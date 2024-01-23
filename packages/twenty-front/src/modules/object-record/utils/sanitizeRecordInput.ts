import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldRelationValue } from '@/object-record/field/types/guards/isFieldRelationValue';
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
        const fieldDefinition = objectMetadataItem.fields.find(
          (field) => field.name === fieldName,
        );

        if (!fieldDefinition) return undefined;

        if (
          fieldDefinition.type === FieldMetadataType.Relation &&
          isFieldRelationValue(fieldValue)
        ) {
          const relationIdFieldName = `${fieldDefinition.name}Id`;
          const relationIdFieldDefinition = objectMetadataItem.fields.find(
            (field) => field.name === relationIdFieldName,
          );

          return relationIdFieldDefinition
            ? [relationIdFieldName, fieldValue?.id ?? null]
            : undefined;
        }

        return [fieldName, fieldValue];
      })
      .filter(isDefined),
  );
};
