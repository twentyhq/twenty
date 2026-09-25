import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RelationFilterValue } from '@/views/view-filter-value/types/RelationFilterValue';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import {
  arrayOfUuidOrVariableSchema,
  getFilterTypeFromFieldType,
  isDefined,
  jsonRelationFilterValueSchema,
} from 'twenty-shared/utils';

type ToggleMineRecordFilterAction =
  | { type: 'upsert'; recordFilter: RecordFilter }
  | { type: 'remove'; recordFilterId: string };

type ComputeToggleMineRecordFilterParams = {
  currentRecordFilters: RecordFilter[];
  toggleMineFilterFieldMetadataItem: FieldMetadataItem;
  newRecordFilterId: string;
};

export const computeToggleMineRecordFilter = ({
  currentRecordFilters,
  toggleMineFilterFieldMetadataItem,
  newRecordFilterId,
}: ComputeToggleMineRecordFilterParams): {
  isMineSelected: boolean;
  toggleAction: ToggleMineRecordFilterAction;
} => {
  const toggleMineFilterSubFieldName =
    toggleMineFilterFieldMetadataItem.type === FieldMetadataType.ACTOR
      ? 'workspaceMemberId'
      : undefined;

  // Same lookup as the native filter dropdown, so "Me" merges into the existing chip
  const recordFilterOnToggleMineFilterField = currentRecordFilters.find(
    (recordFilter) =>
      recordFilter.fieldMetadataId === toggleMineFilterFieldMetadataItem.id &&
      !isDefined(recordFilter.recordFilterGroupId) &&
      recordFilter.operand === ViewFilterOperand.IS &&
      (recordFilter.subFieldName ?? undefined) === toggleMineFilterSubFieldName,
  );

  if (!isDefined(recordFilterOnToggleMineFilterField)) {
    return {
      isMineSelected: false,
      toggleAction: {
        type: 'upsert',
        recordFilter: {
          id: newRecordFilterId,
          fieldMetadataId: toggleMineFilterFieldMetadataItem.id,
          value: JSON.stringify({
            isCurrentWorkspaceMemberSelected: true,
            selectedRecordIds: [],
          } satisfies RelationFilterValue),
          displayValue: 'Me',
          type: getFilterTypeFromFieldType(
            toggleMineFilterFieldMetadataItem.type,
          ),
          operand: ViewFilterOperand.IS,
          label: toggleMineFilterFieldMetadataItem.label,
          subFieldName: toggleMineFilterSubFieldName,
        },
      },
    };
  }

  const { isCurrentWorkspaceMemberSelected, selectedRecordIds } =
    jsonRelationFilterValueSchema
      .catch({
        isCurrentWorkspaceMemberSelected: false,
        selectedRecordIds: arrayOfUuidOrVariableSchema
          .catch([])
          .parse(recordFilterOnToggleMineFilterField.value),
      })
      .parse(recordFilterOnToggleMineFilterField.value);

  const isMineSelected = isCurrentWorkspaceMemberSelected === true;

  if (isMineSelected && selectedRecordIds.length === 0) {
    return {
      isMineSelected,
      toggleAction: {
        type: 'remove',
        recordFilterId: recordFilterOnToggleMineFilterField.id,
      },
    };
  }

  // Filters loaded from a view carry the raw value as display value
  const otherSelectedNames =
    recordFilterOnToggleMineFilterField.displayValue ===
    recordFilterOnToggleMineFilterField.value
      ? []
      : recordFilterOnToggleMineFilterField.displayValue
          .split(', ')
          .filter((name) => isNonEmptyString(name) && name !== 'Me');

  return {
    isMineSelected,
    toggleAction: {
      type: 'upsert',
      recordFilter: {
        ...recordFilterOnToggleMineFilterField,
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: !isMineSelected,
          selectedRecordIds,
        } satisfies RelationFilterValue),
        displayValue: (isMineSelected
          ? otherSelectedNames
          : ['Me', ...otherSelectedNames]
        ).join(', '),
      },
    },
  };
};
