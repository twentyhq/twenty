import { subMinutes } from 'date-fns';

import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { buildValueFromFilter } from '@/object-record/record-table/utils/buildValueFromFilter';
import {
  FieldMetadataType,
  ViewFilterOperand,
  type ObjectRecord,
} from 'twenty-shared/types';
import { deepMerge, isDefined } from 'twenty-shared/utils';

export const buildRecordInputFromFilter = ({
  currentRecordFilters,
  objectMetadataItem,
  currentWorkspaceMember,
}: {
  currentRecordFilters: RecordFilter[];
  objectMetadataItem: EnrichedObjectMetadataItem;
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

      if (isCompositeFieldType(fieldMetadataItem.type)) {
        recordInput[fieldMetadataItem.name] = deepMerge(
          recordInput[fieldMetadataItem.name] ?? {},
          value,
        );
      } else if (
        fieldMetadataItem.type === FieldMetadataType.DATE_TIME &&
        filter.operand === ViewFilterOperand.IS_BEFORE
      ) {
        recordInput[fieldMetadataItem.name] = subMinutes(value as Date, 1);
      } else {
        recordInput[fieldMetadataItem.name] = value;
      }
    }
  });

  return recordInput;
};
