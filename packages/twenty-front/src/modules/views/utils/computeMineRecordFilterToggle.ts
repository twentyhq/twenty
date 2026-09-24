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

type MineRecordFilterToggleAction =
  | { type: 'upsert'; recordFilter: RecordFilter }
  | { type: 'remove'; recordFilterId: string };

type ComputeMineRecordFilterToggleParams = {
  currentRecordFilters: RecordFilter[];
  mineFilterFieldMetadataItem: FieldMetadataItem;
  newRecordFilterId: string;
};

export const computeMineRecordFilterToggle = ({
  currentRecordFilters,
  mineFilterFieldMetadataItem,
  newRecordFilterId,
}: ComputeMineRecordFilterToggleParams): {
  isMineSelected: boolean;
  toggleAction: MineRecordFilterToggleAction;
} => {
  const mineFilterSubFieldName =
    mineFilterFieldMetadataItem.type === FieldMetadataType.ACTOR
      ? 'workspaceMemberId'
      : undefined;

  // Same lookup as the native filter dropdown, so "Me" merges into the existing chip
  const recordFilterOnMineField = currentRecordFilters.find(
    (recordFilter) =>
      recordFilter.fieldMetadataId === mineFilterFieldMetadataItem.id &&
      !isDefined(recordFilter.recordFilterGroupId) &&
      recordFilter.operand === ViewFilterOperand.IS &&
      (recordFilter.subFieldName ?? undefined) === mineFilterSubFieldName,
  );

  if (!isDefined(recordFilterOnMineField)) {
    return {
      isMineSelected: false,
      toggleAction: {
        type: 'upsert',
        recordFilter: {
          id: newRecordFilterId,
          fieldMetadataId: mineFilterFieldMetadataItem.id,
          value: JSON.stringify({
            isCurrentWorkspaceMemberSelected: true,
            selectedRecordIds: [],
          } satisfies RelationFilterValue),
          displayValue: 'Me',
          type: getFilterTypeFromFieldType(mineFilterFieldMetadataItem.type),
          operand: ViewFilterOperand.IS,
          label: mineFilterFieldMetadataItem.label,
          subFieldName: mineFilterSubFieldName,
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
          .parse(recordFilterOnMineField.value),
      })
      .parse(recordFilterOnMineField.value);

  const isMineSelected = isCurrentWorkspaceMemberSelected === true;

  if (isMineSelected && selectedRecordIds.length === 0) {
    return {
      isMineSelected,
      toggleAction: {
        type: 'remove',
        recordFilterId: recordFilterOnMineField.id,
      },
    };
  }

  // Filters loaded from a view carry the raw value as display value
  const otherSelectedNames =
    recordFilterOnMineField.displayValue === recordFilterOnMineField.value
      ? []
      : recordFilterOnMineField.displayValue
          .split(', ')
          .filter((name) => isNonEmptyString(name) && name !== 'Me');

  return {
    isMineSelected,
    toggleAction: {
      type: 'upsert',
      recordFilter: {
        ...recordFilterOnMineField,
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
