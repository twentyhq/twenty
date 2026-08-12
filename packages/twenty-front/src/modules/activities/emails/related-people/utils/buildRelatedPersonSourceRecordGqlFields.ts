import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';
import {
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';

// Every mapped relation's join column is fetched in one go so the query shape
// depends only on the object, not on which relation the user ends up picking.
export const buildRelatedPersonSourceRecordGqlFields = ({
  relatedPersonFieldMetadataItems,
  labelIdentifierFieldMetadataItem,
}: {
  relatedPersonFieldMetadataItems: FieldMetadataItem[];
  labelIdentifierFieldMetadataItem: FieldMetadataItem | undefined;
}): RecordGqlOperationGqlRecordFields => {
  const recordGqlFields: RecordGqlOperationGqlRecordFields = { id: true };

  if (isDefined(labelIdentifierFieldMetadataItem)) {
    recordGqlFields[labelIdentifierFieldMetadataItem.name] = true;
  }

  for (const fieldMetadataItem of relatedPersonFieldMetadataItems) {
    recordGqlFields[
      computeRelationGqlFieldJoinColumnName({ name: fieldMetadataItem.name })
    ] = true;
  }

  return recordGqlFields;
};
