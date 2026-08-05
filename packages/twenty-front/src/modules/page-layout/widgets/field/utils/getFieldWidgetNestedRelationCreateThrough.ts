import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type RecordTableWidgetNestedRelationCreateThrough } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { isNonEmptyString } from '@sniptt/guards';
import { computeRelationGqlFieldJoinColumnName } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

export const getFieldWidgetNestedRelationCreateThrough = ({
  fieldRelationMetadata,
  nestedRelationFieldMetadataItem,
  recordId,
}: {
  fieldRelationMetadata: Pick<
    FieldRelationMetadata,
    'targetFieldMetadataName' | 'relationObjectMetadataNameSingular'
  >;
  nestedRelationFieldMetadataItem: FieldMetadataItem;
  recordId: string;
}): RecordTableWidgetNestedRelationCreateThrough | undefined => {
  // Only a one-to-many first hop leaves the record to create through
  // ambiguous. A many-to-one first hop points at a single intermediate
  // record, so the created record's join column is prefilled from the
  // seeded direct filter instead of a picker.
  if (fieldRelationMetadata.relationType !== RelationType.ONE_TO_MANY) {
    return undefined;
  }

  const relationInverseFieldName =
    fieldRelationMetadata.targetFieldMetadataName;
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
