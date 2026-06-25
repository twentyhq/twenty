import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { RelativeDatePickerCalendarNavigation } from '@/ui/input/components/internal/date/components/RelativeDatePickerCalendarNavigation';
import { RELATIVE_DATE_DIRECTION_SELECT_OPTIONS } from '@/ui/input/components/internal/date/constants/RelativeDateDirectionSelectOptions';
import { RELATIVE_DATETIME_UNITS } from '@/ui/input/components/internal/date/constants/RelativeDateTimeUnitSelectOptions';
import { RELATIVE_DATE_UNITS } from '@/ui/input/components/internal/date/constants/RelativeDateUnitSelectOptions';

import { plural, t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { type Nullable } from 'twenty-shared/types';
import {
  assertUnreachable,
  isDefined,
  relativeDateFilterSchema,
  type RelativeDateFilter,
  type RelativeDateFilterDirection,
  type RelativeDateFilterUnit,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div<{ noPadding: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${({ noPadding }) =>
    noPadding ? '0' : themeCssVariables.spacing[2]};
  padding-bottom: 0;
`;

const StyledControlsRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type RelativeDatePickerHeaderProps = {
  instanceId: string;
  direction: RelativeDateFilterDirection;
  amount?: Nullable<number>;
  unit: RelativeDateFilterUnit;
  onChange?: (value: RelativeDateFilter) => void;
  isFormField?: boolean;
  readonly?: boolean;
  unitDropdownWidth?: number;
  allowIntraDayUnits?: boolean;
  calendarMonthDate?: Date;
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
  prevMonthButtonDisabled?: boolean;
  nextMonthButtonDisabled?: boolean;
};

export const RelativeDatePickerHeader = ({
  instanceId,
  direction,
  unit,
  amount,
  isFormField,
  onChange,
  readonly,
  unitDropdownWidth,
  allowIntraDayUnits,
  calendarMonthDate,
  onPreviousMonth,
  onNextMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: RelativeDatePickerHeaderProps) => {
  const amountString = amount?.toString() ?? '';

  const amountTextValue = direction === 'THIS' ? '' : amountString;
  const amountInputPlaceholder = direction === 'THIS' ? '-' : t`Number`;

  const [draftAmountValue, setDraftAmountValue] = useState(amountTextValue);

  const isUnitPlural = isDefined(amount) && amount > 1 && direction !== 'THIS';
  const unitCount = isUnitPlural ? 2 : 1;

  const getUnitLabel = (unitToLabel: RelativeDateFilterUnit): string => {
    switch (unitToLabel) {
      case 'SECOND':
        return plural(unitCount, { one: 'Second', other: 'Seconds' });
      case 'MINUTE':
        return plural(unitCount, { one: 'Minute', other: 'Minutes' });
      case 'HOUR':
        return plural(unitCount, { one: 'Hour', other: 'Hours' });
      case 'DAY':
        return plural(unitCount, { one: 'Day', other: 'Days' });
      case 'WEEK':
        return plural(unitCount, { one: 'Week', other: 'Weeks' });
      case 'MONTH':
        return plural(unitCount, { one: 'Month', other: 'Months' });
      case 'QUARTER':
        return plural(unitCount, { one: 'Quarter', other: 'Quarters' });
      case 'YEAR':
        return plural(unitCount, { one: 'Year', other: 'Years' });
      default:
        return assertUnreachable(unitToLabel);
    }
  };

  const unitOptionsSource = allowIntraDayUnits
    ? RELATIVE_DATETIME_UNITS
    : RELATIVE_DATE_UNITS;
  const unitSelectOptions = unitOptionsSource.map((unitOption) => ({
    value: unitOption,
    label: getUnitLabel(unitOption),
  }));

  return (
    <StyledContainer noPadding={isFormField ?? false}>
      <StyledControlsRow>
        <Select
          dropdownId={`direction-select-${instanceId}`}
          value={direction}
          onChange={(newDirection) => {
            if (amount === undefined && newDirection !== 'THIS') {
              return;
            }

            if (draftAmountValue === '') {
              setDraftAmountValue('1');
            }

            if (newDirection === 'THIS') {
              setDraftAmountValue('');
            }

            onChange?.({
              direction: newDirection,
              amount: amount,
              unit: unit,
            });
          }}
          options={RELATIVE_DATE_DIRECTION_SELECT_OPTIONS}
          fullWidth
          disabled={readonly}
        />
        <SettingsTextInput
          instanceId={`relative-date-picker-amount-${instanceId}`}
          width={50}
          value={draftAmountValue}
          onChange={(text) => {
            const amountString = text.replace(/[^0-9]|^0+/g, '');
            setDraftAmountValue(amountString);

            const amount = parseInt(amountString);

            const valueParts = {
              direction,
              amount,
              unit,
            };

            if (
              relativeDateFilterSchema.safeParse(valueParts).success === true
            ) {
              onChange?.(valueParts);
            }
          }}
          placeholder={amountInputPlaceholder}
          disabled={direction === 'THIS' || readonly}
        />
        <Select
          dropdownId={`unit-select-${instanceId}`}
          value={unit}
          onChange={(newUnit) => {
            if (direction !== 'THIS' && amount === undefined) {
              return;
            }

            if (draftAmountValue === '' && direction !== 'THIS') {
              setDraftAmountValue('1');
            }

            onChange?.({
              direction,
              amount: amount,
              unit: newUnit,
            });
          }}
          fullWidth
          options={unitSelectOptions}
          disabled={readonly}
          dropdownWidth={unitDropdownWidth}
        />
      </StyledControlsRow>
      {isDefined(calendarMonthDate) &&
        isDefined(onPreviousMonth) &&
        isDefined(onNextMonth) && (
          <RelativeDatePickerCalendarNavigation
            monthLabelDate={calendarMonthDate}
            onPreviousMonth={onPreviousMonth}
            onNextMonth={onNextMonth}
            prevMonthButtonDisabled={prevMonthButtonDisabled ?? false}
            nextMonthButtonDisabled={nextMonthButtonDisabled ?? false}
          />
        )}
    </StyledContainer>
  );
};
