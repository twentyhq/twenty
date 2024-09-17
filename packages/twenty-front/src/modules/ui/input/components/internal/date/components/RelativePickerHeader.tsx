import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { RelativeDateUnit } from '../types/RelativeDateUnit';

import { RelativeDateFilterValue } from '@/object-record/object-filter-dropdown/types/DateFilterValue';
import { RELATIVE_DATE_DIRECTIONS } from '@/ui/input/components/internal/date/constants/RelativeDateDirectionOptions';
import { RELATIVE_DATE_UNITS } from '@/ui/input/components/internal/date/constants/RelativeDateUnits';
import { RelativeDateDirection } from '@/ui/input/components/internal/date/types/RelativeDateDirection';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
  padding-bottom: 0;
`;

type RelativeDatePickerHeaderProps = {
  direction: RelativeDateDirection;
  amount: number;
  unit: RelativeDateUnit;
  onChange?: (value: RelativeDateFilterValue) => void;
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
            type: 'relative',
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
          const amount = parseInt(newNumericValue, 10);

          onChange?.({
            type: 'relative',
            direction,
            amount,
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
            type: 'relative',
            direction: direction,
            amount: amount,
            unit: newUnit,
          })
        }
        options={RELATIVE_DATE_UNITS}
      />
    </StyledContainer>
  );
};
