import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { buildValueFromFilter } from '@/object-record/record-table/utils/buildValueFromFilter';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const buildRecordInputFromFilter = ({
  currentRecordFilters,
  objectMetadataItem,
  currentWorkspaceMember,
}: {
  currentRecordFilters: RecordFilter[];
  objectMetadataItem: ObjectMetadataItem;
  currentWorkspaceMember?: CurrentWorkspaceMember;
}): Partial<ObjectRecord> => {
  const recordInput: Partial<ObjectRecord> = {};

  currentRecordFilters.forEach((filter) => {
    const fieldMetadataItem = objectMetadataItem.fields.find(
      (field) => field.id === filter.fieldMetadataId,
    );

    if (!isDefined(fieldMetadataItem)) {
      return;
    }
    if (fieldMetadataItem.type === 'RELATION') {
      const value = buildValueFromFilter({
        filter,
        options: fieldMetadataItem.options ?? undefined,
        relationType: fieldMetadataItem.relation?.type,
        currentWorkspaceMember: currentWorkspaceMember ?? undefined,
        label: filter.label,
      });
      if (!isDefined(value)) {
        return;
      }
      recordInput[`${fieldMetadataItem.name}Id`] = value;
    } else {
      recordInput[fieldMetadataItem.name] = buildValueFromFilter({
        filter,
        options: fieldMetadataItem.options ?? undefined,
      });
    }
  });

  return recordInput;
};
