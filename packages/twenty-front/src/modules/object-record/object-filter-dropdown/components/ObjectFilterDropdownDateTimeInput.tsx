import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { UserContext } from '@/users/contexts/UserContext';
import { computeVariableDateViewFilterValue } from '@/views/view-filter-value/utils/computeVariableDateViewFilterValue';
import { useContext, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  ViewFilterOperand,
  type VariableDateViewFilterValueDirection,
  type VariableDateViewFilterValueUnit,
} from 'twenty-shared/types';
import { isDefined, resolveDateViewFilterValue } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateString } from '~/utils/string/formatDateString';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

export const ObjectFilterDropdownDateTimeInput = () => {
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useRecoilValue(dateLocaleState);

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedOperandInDropdown = useRecoilComponentValue(
    selectedOperandInDropdownComponentState,
  );

  const objectFilterDropdownCurrentRecordFilter = useRecoilComponentValue(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const initialFilterValue = isDefined(objectFilterDropdownCurrentRecordFilter)
    ? resolveDateViewFilterValue(objectFilterDropdownCurrentRecordFilter)
    : null;

  const [internalDate, setInternalDate] = useState<Date | null>(
    initialFilterValue instanceof Date ? initialFilterValue : null,
  );

  const isDateTimeInput =
    fieldMetadataItemUsedInDropdown?.type === FieldMetadataType.DATE_TIME;

  const handleAbsoluteDateChange = (newDate: Date | null) => {
    setInternalDate(newDate);

    const newFilterValue = newDate?.toISOString() ?? '';

    const formattedDateTime = formatDateTimeString({
      value: newDate?.toISOString(),
      timeZone,
      dateFormat,
      timeFormat,
      localeCatalog: dateLocale.localeCatalog,
    });

    const formattedDate = formatDateString({
      value: newDate?.toISOString(),
      timeZone,
      dateFormat,
      localeCatalog: dateLocale.localeCatalog,
    });

    const newDisplayValue = isDefined(newDate)
      ? isDateTimeInput
        ? formattedDateTime
        : formattedDate
      : '';

    applyObjectFilterDropdownFilterValue(newFilterValue, newDisplayValue);
  };

  const handleRelativeDateChange = (
    relativeDate: {
      direction: VariableDateViewFilterValueDirection;
      amount?: number;
      unit: VariableDateViewFilterValueUnit;
    } | null,
  ) => {
    const newFilterValue = relativeDate
      ? computeVariableDateViewFilterValue(
          relativeDate.direction,
          relativeDate.amount,
          relativeDate.unit,
        )
      : '';

    const newDisplayValue = relativeDate
      ? getRelativeDateDisplayValue(relativeDate)
      : '';

    applyObjectFilterDropdownFilterValue(newFilterValue, newDisplayValue);
  };

  const isRelativeOperand =
    selectedOperandInDropdown === ViewFilterOperand.IS_RELATIVE;

  const handleClear = () => {
    isRelativeOperand
      ? handleRelativeDateChange(null)
      : handleAbsoluteDateChange(null);
  };
  const resolvedValue = objectFilterDropdownCurrentRecordFilter
    ? resolveDateViewFilterValue(objectFilterDropdownCurrentRecordFilter)
    : null;

  const relativeDate =
    resolvedValue && !(resolvedValue instanceof Date)
      ? resolvedValue
      : undefined;

  return (
    <DateTimePicker
      relativeDate={relativeDate}
      highlightedDateRange={relativeDate}
      isRelative={isRelativeOperand}
      date={internalDate}
      onChange={handleAbsoluteDateChange}
      onRelativeDateChange={handleRelativeDateChange}
      onClear={handleClear}
    />
  );
};
