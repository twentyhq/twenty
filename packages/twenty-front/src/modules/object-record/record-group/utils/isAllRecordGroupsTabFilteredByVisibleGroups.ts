import { type FieldWithRelation } from '@/object-metadata/utils/isRelationFieldOfType';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type IsAllRecordGroupsTabFilteredByVisibleGroupsArgs = {
  hiddenRecordGroupIds: string[];
  recordGroupFieldMetadata: FieldWithRelation | null | undefined;
};

// Relation groups only cover the related records configured as groups,
// so All must be narrowed to them even when no group is hidden
export const isAllRecordGroupsTabFilteredByVisibleGroups = ({
  hiddenRecordGroupIds,
  recordGroupFieldMetadata,
}: IsAllRecordGroupsTabFilteredByVisibleGroupsArgs): boolean =>
  isNonEmptyArray(hiddenRecordGroupIds) ||
  (isDefined(recordGroupFieldMetadata) &&
    isManyToOneRelationField(recordGroupFieldMetadata));
