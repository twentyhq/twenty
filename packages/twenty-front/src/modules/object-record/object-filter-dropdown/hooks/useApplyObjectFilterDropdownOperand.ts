import { DATE_OPERANDS_THAT_SHOULD_BE_INITIALIZED_WITH_NOW } from '@/object-record/object-filter-dropdown/constants/DateOperandsThatShouldBeInitializedWithNow';
import { useUpsertObjectFilterDropdownCurrentFilter } from '@/object-record/object-filter-dropdown/hooks/useUpsertObjectFilterDropdownCurrentFilter';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { getDateFilterDisplayValue } from '@/object-record/record-filter/utils/getDateFilterDisplayValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { computeVariableDateViewFilterValue } from '@/views/view-filter-value/utils/computeVariableDateViewFilterValue';
import {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/view-filter-value/utils/resolveDateViewFilterValue';
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

  const applyObjectFilterDropdownOperand = (
    newOperand: RecordFilterOperand,
  ) => {
    const isValuelessOperand = [
      RecordFilterOperand.IsEmpty,
      RecordFilterOperand.IsNotEmpty,
      RecordFilterOperand.IsInPast,
      RecordFilterOperand.IsInFuture,
      RecordFilterOperand.IsToday,
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
        const newDateValue = new Date();

        recordFilterToUpsert.value = newDateValue.toISOString();
        const { displayValue } = getDateFilterDisplayValue(
          newDateValue,
          recordFilterToUpsert.type,
        );

        recordFilterToUpsert.displayValue = displayValue;
      } else if (newOperand === RecordFilterOperand.IsRelative) {
        const defaultRelativeDate = {
          direction: 'THIS' as VariableDateViewFilterValueDirection,
          amount: 1,
          unit: 'DAY' as VariableDateViewFilterValueUnit,
        };

        recordFilterToUpsert.value = computeVariableDateViewFilterValue(
          defaultRelativeDate.direction,
          defaultRelativeDate.amount,
          defaultRelativeDate.unit,
        );
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
