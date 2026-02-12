import { useUpsertObjectFilterDropdownCurrentFilter } from '@/object-record/object-filter-dropdown/hooks/useUpsertObjectFilterDropdownCurrentFilter';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useGetRelativeDateFilterWithUserTimezone } from '@/object-record/record-filter/hooks/useGetRelativeDateFilterWithUserTimezone';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';

import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import { DEFAULT_RELATIVE_DATE_FILTER_VALUE } from 'twenty-shared/constants';

import {
  isDefined,
  relativeDateFilterStringifiedSchema,
} from 'twenty-shared/utils';

export const useApplyObjectFilterDropdownOperand = () => {
  const { userTimezone } = useUserTimezone();
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
      if (newOperand === RecordFilterOperand.IS_RELATIVE) {
        const newRelativeDateFilter = getRelativeDateFilterWithUserTimezone(
          DEFAULT_RELATIVE_DATE_FILTER_VALUE,
        );

        recordFilterToUpsert.value = stringifyRelativeDateFilter(
          newRelativeDateFilter,
        );
      } else {
        const filterValueIsEmpty = !isNonEmptyString(
          recordFilterToUpsert.value,
        );

        const isStillRelativeFilterValue =
          relativeDateFilterStringifiedSchema.safeParse(
            recordFilterToUpsert.value,
          );

        if (filterValueIsEmpty || isStillRelativeFilterValue.success) {
          const zonedDateToUse = Temporal.Now.zonedDateTimeISO(userTimezone);

          if (recordFilterToUpsert.type === 'DATE') {
            const initialNowDateFilterValue = zonedDateToUse
              .toPlainDate()
              .toString();

            recordFilterToUpsert.value = initialNowDateFilterValue;
          } else {
            const initialNowDateTimeFilterValue = zonedDateToUse
              .toInstant()
              .toString();

            recordFilterToUpsert.value = initialNowDateTimeFilterValue;
          }
        }
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
