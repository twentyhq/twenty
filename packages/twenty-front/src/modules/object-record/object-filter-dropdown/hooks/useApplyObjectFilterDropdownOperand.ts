import { DATE_OPERANDS_THAT_SHOULD_BE_INITIALIZED_WITH_NOW } from '@/object-record/object-filter-dropdown/constants/DateOperandsThatShouldBeInitializedWithNow';
import { useGetInitialFilterValue } from '@/object-record/object-filter-dropdown/hooks/useGetInitialFilterValue';
import { useGetNowInUserTimezoneForRelativeFilter } from '@/object-record/object-filter-dropdown/hooks/useGetNowInUserTimezoneForRelativeFilter';
import { useUpsertObjectFilterDropdownCurrentFilter } from '@/object-record/object-filter-dropdown/hooks/useUpsertObjectFilterDropdownCurrentFilter';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';

import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { computeVariableDateViewFilterValue } from '@/views/view-filter-value/utils/computeVariableDateViewFilterValue';
import {
  type VariableDateViewFilterValueDirection,
  type VariableDateViewFilterValueUnit,
} from 'twenty-shared/types';
import { isDefined, type RelativeDateFilter } from 'twenty-shared/utils';

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

  const { userTimezone } = useUserTimezone();

  const { getNowInUserTimezoneForRelativeFilter } =
    useGetNowInUserTimezoneForRelativeFilter();

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
        const { displayValue, value } = getInitialFilterValue(
          recordFilterToUpsert.type,
          newOperand,
          recordFilterToUpsert.value,
        );

        recordFilterToUpsert.value = value;

        recordFilterToUpsert.displayValue = displayValue;
      } else if (newOperand === RecordFilterOperand.IS_RELATIVE) {
        const { dayAsStringInUserTimezone, nowInUserTimezone } =
          getNowInUserTimezoneForRelativeFilter();

        const defaultRelativeDate: RelativeDateFilter = {
          direction: 'THIS' as VariableDateViewFilterValueDirection,
          amount: 1,
          unit: 'DAY' as VariableDateViewFilterValueUnit,
          timezone: userTimezone,
          referenceDayAsString: dayAsStringInUserTimezone,
        };

        console.log({
          defaultRelativeDate,
        });

        recordFilterToUpsert.value =
          computeVariableDateViewFilterValue(defaultRelativeDate);

        recordFilterToUpsert.displayValue =
          getRelativeDateDisplayValue(defaultRelativeDate);
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
