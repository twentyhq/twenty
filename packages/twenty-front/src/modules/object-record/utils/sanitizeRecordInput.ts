import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { RelationDefinitionType } from '~/generated-metadata/graphql';
import { FieldMetadataType } from '~/generated/graphql';

export const sanitizeRecordInput = ({
  objectMetadataItem,
  recordInput,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordInput: Partial<ObjectRecord>;
}) => {
  const filteredResultRecord = Object.fromEntries(
    Object.entries(recordInput)
      .map<[string, unknown] | undefined>(([fieldName, fieldValue]) => {
        const fieldMetadataItem = objectMetadataItem.fields.find(
          (field) => field.name === fieldName,
        );
        const potentialJoinColumnNameFieldMetadataItem =
          objectMetadataItem.fields.find(
            (field) =>
              field.type === FieldMetadataType.RELATION &&
              field.settings?.joinColumnName === fieldName,
          );

        if (
          !isDefined(fieldMetadataItem) &&
          !isDefined(potentialJoinColumnNameFieldMetadataItem)
        ) {
          return undefined;
        }

        if (fieldMetadataItem?.isNullable === false && fieldValue == null) {
          return undefined;
        }

        if (
          isDefined(fieldMetadataItem) &&
          fieldMetadataItem.type === FieldMetadataType.RELATION &&
          fieldMetadataItem.relationDefinition?.direction ===
            RelationDefinitionType.MANY_TO_ONE
        ) {
          const relationIdFieldName = `${fieldMetadataItem.name}Id`;
          const relationIdFieldMetadataItem = objectMetadataItem.fields.find(
            (field) => field.name === relationIdFieldName,
          );

          const relationIdFieldValue = recordInput[relationIdFieldName];

          return relationIdFieldMetadataItem
            ? [relationIdFieldName, relationIdFieldValue ?? null]
            : undefined;
        }

        if (
          isDefined(fieldMetadataItem) &&
          fieldMetadataItem.type === FieldMetadataType.RELATION &&
          fieldMetadataItem.relationDefinition?.direction ===
            RelationDefinitionType.ONE_TO_MANY
        ) {
          return undefined;
        }

        // Todo: we should check that the fieldValue is a valid value
        // (e.g. a string for a string field, following the right composite structure for composite fields)
        return [fieldName, fieldValue];
      })
      .filter(isDefined),
  );
  return filteredResultRecord;
};
