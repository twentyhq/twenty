import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { buildValueFromFilter } from '@/object-record/record-table/utils/buildValueFromFilter';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

const mergeCompositeValues = (
  existingValue: unknown,
  incomingValue: unknown,
) =>
  isPlainObject(existingValue) && isPlainObject(incomingValue)
    ? { ...existingValue, ...incomingValue }
    : incomingValue;

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
      const value = buildValueFromFilter({
        filter,
        options: fieldMetadataItem.options ?? undefined,
      });
      if (!isDefined(value)) {
        return;
      }
      recordInput[fieldMetadataItem.name] = mergeCompositeValues(
        recordInput[fieldMetadataItem.name],
        value,
      );
    }
  });

  return recordInput;
};
