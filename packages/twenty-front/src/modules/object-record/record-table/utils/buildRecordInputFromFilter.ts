import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { buildValueFromFilter } from '@/object-record/record-table/utils/buildValueFromFilter';
import { type ObjectRecord } from 'twenty-shared/types';
import { deepMerge, isDefined } from 'twenty-shared/utils';

export const buildRecordInputFromFilter = ({
  currentRecordFilters,
  objectMetadataItem,
  currentWorkspaceMember,
  currentRecordId,
  timeZone,
}: {
  currentRecordFilters: RecordFilter[];
  objectMetadataItem: EnrichedObjectMetadataItem;
  currentWorkspaceMember?: CurrentWorkspaceMember;
  currentRecordId?: string;
  timeZone?: string;
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
        currentRecordId,
        label: filter.label,
        timeZone,
      });

      if (!isDefined(value)) {
        return;
      }

      recordInput[`${fieldMetadataItem.name}Id`] = value;
    } else {
      const value = buildValueFromFilter({
        filter,
        options: fieldMetadataItem.options ?? undefined,
        timeZone,
      });

      if (!isDefined(value)) {
        return;
      }

      if (isCompositeFieldType(fieldMetadataItem.type)) {
        recordInput[fieldMetadataItem.name] = deepMerge(
          recordInput[fieldMetadataItem.name] ?? {},
          value,
        );
      } else {
        recordInput[fieldMetadataItem.name] = value;
      }
    }
  });

  return recordInput;
};
