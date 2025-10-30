import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { DatePicker } from '@/ui/input/components/internal/date/components/DatePicker';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { UserContext } from '@/users/contexts/UserContext';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  isDefined,
  type RelativeDateFilter,
  resolveDateFilter,
} from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateString } from '~/utils/string/formatDateString';

export const ObjectFilterDropdownDateInput = () => {
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

  const filterValue = isDefined(objectFilterDropdownCurrentRecordFilter)
    ? resolveDateFilter(objectFilterDropdownCurrentRecordFilter)
    : null;

  const handleAbsoluteDateChange = (newPlainDate: string | null) => {
    const newFilterValue = newPlainDate ?? '';

    const formattedDate = formatDateString({
      value: newPlainDate,
      timeZone,
      dateFormat,
      localeCatalog: dateLocale.localeCatalog,
    });

    const newDisplayValue = isDefined(newPlainDate) ? formattedDate : '';

    applyObjectFilterDropdownFilterValue(newFilterValue, newDisplayValue);
  };

  const handleRelativeDateChange = (
    relativeDate: RelativeDateFilter | null,
  ) => {
    const newFilterValue = relativeDate
      ? stringifyRelativeDateFilter(relativeDate)
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
    ? resolveDateFilter(objectFilterDropdownCurrentRecordFilter)
    : null;

  const relativeDate =
    resolvedValue && typeof resolvedValue === 'object'
      ? resolvedValue
      : undefined;

  const plainDateValue =
    resolvedValue && typeof resolvedValue === 'string'
      ? resolvedValue
      : undefined;

  return (
    <DatePicker
      relativeDate={relativeDate}
      highlightedDateRange={relativeDate}
      isRelative={isRelativeOperand}
      date={plainDateValue ?? null}
      onChange={handleAbsoluteDateChange}
      onRelativeDateChange={handleRelativeDateChange}
      onClear={handleClear}
    />
  );
};
