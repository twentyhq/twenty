import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type RecordTableWidgetNestedRelationCreateThrough } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { isNonEmptyString } from '@sniptt/guards';
import { computeRelationGqlFieldJoinColumnName } from 'twenty-shared/utils';

export const getFieldWidgetNestedRelationCreateThrough = ({
  fieldRelationMetadata,
  nestedRelationFieldMetadataItem,
  recordId,
}: {
  fieldRelationMetadata: FieldRelationMetadata;
  nestedRelationFieldMetadataItem: FieldMetadataItem;
  recordId: string;
}): RecordTableWidgetNestedRelationCreateThrough | undefined => {
  const relationInverseFieldName = fieldRelationMetadata.targetFieldMetadataName;
  const nestedRelationInverseFieldName =
    nestedRelationFieldMetadataItem.relation?.targetFieldMetadata.name;

  if (
    !isNonEmptyString(relationInverseFieldName) ||
    !isNonEmptyString(nestedRelationInverseFieldName)
  ) {
    return undefined;
  }

  return {
    relationObjectMetadataNameSingular:
      fieldRelationMetadata.relationObjectMetadataNameSingular,
    relationRecordsFilter: {
      [computeRelationGqlFieldJoinColumnName({
        name: relationInverseFieldName,
      })]: { eq: recordId },
    },
    nestedRelationJoinColumnName: computeRelationGqlFieldJoinColumnName({
      name: nestedRelationInverseFieldName,
    }),
  };
};
