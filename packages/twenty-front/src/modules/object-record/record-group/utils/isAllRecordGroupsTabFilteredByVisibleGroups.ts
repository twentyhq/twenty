import { type FieldWithRelation } from '@/object-metadata/utils/isRelationFieldOfType';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type IsAllRecordGroupsTabFilteredByVisibleGroupsArgs = {
  hiddenRecordGroupIds: string[];
  recordGroupFieldMetadata: FieldWithRelation | null | undefined;
};

// Relation groups cover only the configured related records, so All is narrowed even with none hidden
export const isAllRecordGroupsTabFilteredByVisibleGroups = ({
  hiddenRecordGroupIds,
  recordGroupFieldMetadata,
}: IsAllRecordGroupsTabFilteredByVisibleGroupsArgs): boolean =>
  isNonEmptyArray(hiddenRecordGroupIds) ||
  (isDefined(recordGroupFieldMetadata) &&
    isManyToOneRelationField(recordGroupFieldMetadata));
