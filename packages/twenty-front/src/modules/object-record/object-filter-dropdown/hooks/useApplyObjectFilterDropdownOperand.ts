import { DATE_OPERANDS_THAT_SHOULD_BE_INITIALIZED_WITH_NOW } from '@/object-record/object-filter-dropdown/constants/DateOperandsThatShouldBeInitializedWithNow';
import { useGetInitialFilterValue } from '@/object-record/object-filter-dropdown/hooks/useGetInitialFilterValue';
import { useUpsertObjectFilterDropdownCurrentFilter } from '@/object-record/object-filter-dropdown/hooks/useUpsertObjectFilterDropdownCurrentFilter';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useGetRelativeDateFilterWithUserTimezone } from '@/object-record/record-filter/hooks/useGetRelativeDateFilterWithUserTimezone';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';

import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
import { DEFAULT_RELATIVE_DATE_FILTER_VALUE } from 'twenty-shared/constants';

import { isDefined } from 'twenty-shared/utils';

export const useApplyObjectFilterDropdownOperand = () => {
  const objectFilterDropdownCurrentRecordFilter = useRecoilComponentValue(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentState(
    selectedOperandInDropdownComponentState,
  );

  const objectFilterDropdownFilterHasBeenCreated = isDefined(
    objectFilterDropdownCurrentRecordFilter,
  );

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const { upsertObjectFilterDropdownCurrentFilter } =
    useUpsertObjectFilterDropdownCurrentFilter();

  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();

  const { getInitialFilterValue } = useGetInitialFilterValue();

  const { getRelativeDateFilterWithUserTimezone } =
    useGetRelativeDateFilterWithUserTimezone();

  const applyObjectFilterDropdownOperand = (
    newOperand: RecordFilterOperand,
  ) => {
    const isValuelessOperand = [
      RecordFilterOperand.IS_EMPTY,
      RecordFilterOperand.IS_NOT_EMPTY,
      RecordFilterOperand.IS_IN_PAST,
      RecordFilterOperand.IS_IN_FUTURE,
      RecordFilterOperand.IS_TODAY,
    ].includes(newOperand);

    let recordFilterToUpsert: RecordFilter | null | undefined = null;

    if (objectFilterDropdownFilterHasBeenCreated) {
      recordFilterToUpsert = {
        ...objectFilterDropdownCurrentRecordFilter,
        operand: newOperand,
      } satisfies RecordFilter;
    } else if (isValuelessOperand) {
      if (!isDefined(fieldMetadataItemUsedInDropdown)) {
        throw new Error(
          'FieldMetadataItemUsedInDropdown is not defined, cannot create empty record filter, this should not happen',
        );
      }

      const { newRecordFilter: emptyRecordFilter } =
        createEmptyRecordFilterFromFieldMetadataItem(
          fieldMetadataItemUsedInDropdown,
        );

      recordFilterToUpsert = {
        ...emptyRecordFilter,
        operand: newOperand,
      } satisfies RecordFilter;
    }

    if (
      isDefined(recordFilterToUpsert) &&
      (recordFilterToUpsert.type === 'DATE' ||
        recordFilterToUpsert.type === 'DATE_TIME')
    ) {
      if (
        DATE_OPERANDS_THAT_SHOULD_BE_INITIALIZED_WITH_NOW.includes(newOperand)
      ) {
        // TODO: allow to keep same value when switching between is after, is before, is and is not
        // For now we reset with now each time we switch operand

        const dateToUseAsISOString = new Date().toISOString();

        const { displayValue, value } = getInitialFilterValue(
          recordFilterToUpsert.type,
          newOperand,
          dateToUseAsISOString,
        );

        recordFilterToUpsert.value = value;

        recordFilterToUpsert.displayValue = displayValue;
      } else if (newOperand === RecordFilterOperand.IS_RELATIVE) {
        const newRelativeDateFilter = getRelativeDateFilterWithUserTimezone(
          DEFAULT_RELATIVE_DATE_FILTER_VALUE,
        );

        recordFilterToUpsert.value = stringifyRelativeDateFilter(
          newRelativeDateFilter,
        );

        recordFilterToUpsert.displayValue = getRelativeDateDisplayValue(
          newRelativeDateFilter,
        );
      } else {
        recordFilterToUpsert.value = '';
        recordFilterToUpsert.displayValue = '';
      }
    }

    if (isDefined(recordFilterToUpsert)) {
      upsertObjectFilterDropdownCurrentFilter(recordFilterToUpsert);
    }

    setSelectedOperandInDropdown(newOperand);
  };

  return {
    applyObjectFilterDropdownOperand,
  };
};
