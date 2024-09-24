import { RELATIVE_DATE_DIRECTION_SELECT_OPTIONS } from '@/ui/input/components/internal/date/constants/RelativeDateDirectionSelectOptions';
import { RELATIVE_DATE_UNITS_SELECT_OPTIONS } from '@/ui/input/components/internal/date/constants/RelativeDateUnitSelectOptions';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import {
  variableDateViewFilterValueAmountSchema,
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/utils/view-filter-value/resolveDateViewFilterValue';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
  padding-bottom: 0;
`;

type RelativeDatePickerHeaderProps = {
  direction: VariableDateViewFilterValueDirection;
  amount: number;
  unit: VariableDateViewFilterValueUnit;
  onChange?: (value: {
    direction: VariableDateViewFilterValueDirection;
    amount: number;
    unit: VariableDateViewFilterValueUnit;
  }) => void;
};

export const RelativeDatePickerHeader = ({
  direction,
  amount,
  unit,
  onChange,
}: RelativeDatePickerHeaderProps) => {
  const [amountString, setAmountString] = useState(
    amount ? amount.toString() : '',
  );

  useEffect(() => {
    setAmountString(amount ? amount.toString() : '');
  }, [amount]);

  const textInputValue = direction === 'THIS' ? '' : amountString;
  const textInputPlaceholder = direction === 'THIS' ? '-' : 'Number';

  const isUnitPlural = amount > 1 && direction !== 'THIS';
  const unitSelectOptions = RELATIVE_DATE_UNITS_SELECT_OPTIONS.map((unit) => ({
    ...unit,
    label: `${unit.label}${isUnitPlural ? 's' : ''}`,
  }));

  return (
    <StyledContainer>
      <Select
        dropdownId="direction-select"
        value={direction}
        onChange={(newDirection) =>
          onChange?.({
            direction: newDirection,
            amount: amount,
            unit: unit,
          })
        }
        options={RELATIVE_DATE_DIRECTION_SELECT_OPTIONS}
      />
      <TextInput
        value={textInputValue}
        onChange={(text) => {
          const amountString = text.replace(/[^0-9]/g, ''); // TODO: Remove leading zeros
          const amount = parseInt(amountString);

          setAmountString(amountString);

          if (
            variableDateViewFilterValueAmountSchema.safeParse(amount).success
          ) {
            onChange?.({
              direction,
              amount,
              unit,
            });
          }
        }}
        placeholder={textInputPlaceholder}
        disabled={direction === 'THIS'}
      />
      <Select
        dropdownId="unit-select"
        value={unit}
        onChange={(newUnit) =>
          onChange?.({
            direction,
            amount,
            unit: newUnit,
          })
        }
        options={unitSelectOptions}
      />
    </StyledContainer>
  );
};
