import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isSystemSearchVectorField } from '@/object-record/utils/isSystemSearchVectorField';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

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
        if (isSystemSearchVectorField(fieldName)) {
          return undefined;
        }

        const fieldMetadataItem = objectMetadataItem.fields.find(
          (field) => field.name === fieldName,
        );
        const potentialJoinColumnNameFieldMetadataItem =
          objectMetadataItem.fields.find(
            (field) =>
              field.type === FieldMetadataType.RELATION &&
              field.settings?.joinColumnName === fieldName,
          );
        const potentialMorphRelationJoinColumnNameFieldMetadataItem =
          objectMetadataItem.fields.find((field) => {
            if (!isFieldMorphRelation(field)) return false;
            return field.morphRelations?.some((morphRelation) => {
              const computedFieldName = computeMorphRelationFieldName({
                fieldName: field.name,
                relationType: morphRelation.type,
                targetObjectMetadataNameSingular:
                  morphRelation.targetObjectMetadata.nameSingular,
                targetObjectMetadataNamePlural:
                  morphRelation.targetObjectMetadata.namePlural,
              });
              return computedFieldName === fieldName.replace('Id', '');
            });
          });

        if (
          !isDefined(fieldMetadataItem) &&
          !isDefined(potentialJoinColumnNameFieldMetadataItem) &&
          !isDefined(potentialMorphRelationJoinColumnNameFieldMetadataItem)
        ) {
          return undefined;
        }

        if (fieldMetadataItem?.isNullable === false && fieldValue == null) {
          return undefined;
        }

        if (
          isDefined(fieldMetadataItem) &&
          fieldMetadataItem.type === FieldMetadataType.RELATION &&
          fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE &&
          !isDefined(recordInput[fieldMetadataItem.name]?.connect?.where)
        ) {
          return undefined;
        }

        if (
          isDefined(fieldMetadataItem) &&
          fieldMetadataItem.type === FieldMetadataType.RELATION &&
          fieldMetadataItem.relation?.type === RelationType.ONE_TO_MANY
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
