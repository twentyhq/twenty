import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { RELATIVE_DATE_DIRECTION_SELECT_OPTIONS } from '@/ui/input/components/internal/date/constants/RelativeDateDirectionSelectOptions';
import { RELATIVE_DATE_UNITS_SELECT_OPTIONS } from '@/ui/input/components/internal/date/constants/RelativeDateUnitSelectOptions';
import {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
  variableDateViewFilterValuePartsSchema,
} from '@/views/view-filter-value/utils/resolveDateViewFilterValue';

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
  amount?: number;
  unit: VariableDateViewFilterValueUnit;
  onChange?: (value: {
    direction: VariableDateViewFilterValueDirection;
    amount?: number;
    unit: VariableDateViewFilterValueUnit;
  }) => void;
};

export const RelativeDatePickerHeader = (
  props: RelativeDatePickerHeaderProps,
) => {
  const [direction, setDirection] = useState(props.direction);
  const [amountString, setAmountString] = useState(
    props.amount ? props.amount.toString() : '',
  );
  const [unit, setUnit] = useState(props.unit);

  useEffect(() => {
    setAmountString(props.amount ? props.amount.toString() : '');
    setUnit(props.unit);
    setDirection(props.direction);
  }, [props.amount, props.unit, props.direction]);

  const textInputValue = direction === 'THIS' ? '' : amountString;
  const textInputPlaceholder = direction === 'THIS' ? '-' : 'Number';

  const isUnitPlural = props.amount && props.amount > 1 && direction !== 'THIS';
  const unitSelectOptions = RELATIVE_DATE_UNITS_SELECT_OPTIONS.map((unit) => ({
    ...unit,
    label: `${unit.label}${isUnitPlural ? 's' : ''}`,
  }));

  return (
    <StyledContainer>
      <Select
        dropdownId="direction-select"
        value={direction}
        onChange={(newDirection) => {
          setDirection(newDirection);
          if (props.amount === undefined && newDirection !== 'THIS') return;
          props.onChange?.({
            direction: newDirection,
            amount: props.amount,
            unit: unit,
          });
        }}
        options={RELATIVE_DATE_DIRECTION_SELECT_OPTIONS}
      />
      <TextInput
        value={textInputValue}
        onChange={(text) => {
          const amountString = text.replace(/[^0-9]|^0+/g, '');
          const amount = parseInt(amountString);

          setAmountString(amountString);

          const valueParts = {
            direction,
            amount,
            unit,
          };

          if (
            variableDateViewFilterValuePartsSchema.safeParse(valueParts).success
          ) {
            props.onChange?.(valueParts);
          }
        }}
        placeholder={textInputPlaceholder}
        disabled={direction === 'THIS'}
      />
      <Select
        dropdownId="unit-select"
        value={unit}
        onChange={(newUnit) => {
          setUnit(newUnit);
          if (direction !== 'THIS' && props.amount === undefined) return;
          props.onChange?.({
            direction,
            amount: props.amount,
            unit: newUnit,
          });
        }}
        options={unitSelectOptions}
      />
    </StyledContainer>
  );
};
