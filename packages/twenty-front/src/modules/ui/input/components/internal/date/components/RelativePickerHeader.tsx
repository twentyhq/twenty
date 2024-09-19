import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';

import { RELATIVE_DATE_DIRECTIONS } from '@/ui/input/components/internal/date/constants/RelativeDateDirectionOptions';
import { RELATIVE_DATE_UNITS } from '@/ui/input/components/internal/date/constants/RelativeDateUnits';
import {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
} from '@/views/utils/view-filter-value/resolveDateViewFilterValue';
import styled from '@emotion/styled';

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
        options={RELATIVE_DATE_DIRECTIONS}
      />
      <TextInput
        value={amount?.toString() ?? ''}
        onChange={(newValue) => {
          const newNumericValue = newValue.replace(/[^0-9]/g, '');
          if (!newNumericValue) return;
          const newAmount = parseInt(newNumericValue, 10);

          onChange?.({
            direction,
            amount: newAmount,
            unit,
          });
        }}
        placeholder="Number"
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
        options={RELATIVE_DATE_UNITS.map((unit) => ({
          ...unit,
          label: `${unit.label}${amount > 1 ? 's' : ''}`,
        }))}
      />
    </StyledContainer>
  );
};
