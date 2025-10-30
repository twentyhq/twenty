import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { RELATIVE_DATE_DIRECTION_SELECT_OPTIONS } from '@/ui/input/components/internal/date/constants/RelativeDateDirectionSelectOptions';
import { RELATIVE_DATE_UNITS_SELECT_OPTIONS } from '@/ui/input/components/internal/date/constants/RelativeDateUnitSelectOptions';

import styled from '@emotion/styled';
import { type Nullable } from 'twenty-shared/types';
import {
  relativeDateFilterSchema,
  type RelativeDateFilter,
  type RelativeDateFilterDirection,
  type RelativeDateFilterUnit,
} from 'twenty-shared/utils';

const StyledContainer = styled.div<{ noPadding: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme, noPadding }) => (noPadding ? '0' : theme.spacing(2))};
  padding-bottom: 0;
`;

type RelativeDatePickerHeaderProps = {
  direction: RelativeDateFilterDirection;
  amount?: Nullable<number>;
  unit: RelativeDateFilterUnit;
  onChange?: (value: RelativeDateFilter) => void;
  isFormField?: boolean;
  readonly?: boolean;
  unitDropdownWidth?: number;
};

export const RelativeDatePickerHeader = ({
  direction,
  unit,
  amount,
  isFormField,
  onChange,
  readonly,
  unitDropdownWidth,
}: RelativeDatePickerHeaderProps) => {
  const amountString = amount?.toString() ?? '';

  const textInputValue = direction === 'THIS' ? '' : amountString;
  const textInputPlaceholder = direction === 'THIS' ? '-' : 'Number';

  const isUnitPlural = amount && amount > 1 && direction !== 'THIS';
  const unitSelectOptions = RELATIVE_DATE_UNITS_SELECT_OPTIONS.map((unit) => ({
    ...unit,
    label: `${unit.label}${isUnitPlural ? 's' : ''}`,
  }));

  return (
    <StyledContainer noPadding={isFormField ?? false}>
      <Select
        dropdownId="direction-select"
        value={direction}
        onChange={(newDirection) => {
          if (amount === undefined && newDirection !== 'THIS') {
            return;
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
        instanceId="relative-date-picker-amount"
        width={50}
        value={textInputValue}
        onChange={(text) => {
          const amountString = text.replace(/[^0-9]|^0+/g, '');
          const amount = parseInt(amountString);

          const valueParts = {
            direction,
            amount,
            unit,
          };

          if (relativeDateFilterSchema.safeParse(valueParts).success === true) {
            onChange?.(valueParts);
          }
        }}
        placeholder={textInputPlaceholder}
        disabled={direction === 'THIS' || readonly}
      />
      <Select
        dropdownId="unit-select"
        value={unit}
        onChange={(newUnit) => {
          if (direction !== 'THIS' && amount === undefined) {
            return;
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
    </StyledContainer>
  );
};
