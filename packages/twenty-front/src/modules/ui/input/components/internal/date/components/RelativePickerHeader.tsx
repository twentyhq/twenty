import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { RelativeDateUnit } from '../types/RelativeDateUnit';

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
  direction?: RelativeDateDirection;
  value?: number;
  unit?: RelativeDateUnit;
  onChange: (value: {
    direction?: RelativeDateDirection;
    value?: number;
    unit?: RelativeDateUnit;
  }) => void;
};

export const RelativeDatePickerHeader = ({
  direction,
  value,
  unit,
  onChange,
}: RelativeDatePickerHeaderProps) => {
  return (
    <StyledContainer>
      <Select
        dropdownId="direction-select"
        value={direction}
        onChange={(newDirection) =>
          onChange({
            direction: newDirection,
            value: value,
            unit: unit,
          })
        }
        options={RELATIVE_DATE_DIRECTIONS}
      />
      <TextInput
        value={value?.toString() ?? ''}
        onChange={(newValue) => {
          const newNumericValue = newValue.replace(/[^0-9]/g, '');
          const value = newNumericValue
            ? parseInt(newNumericValue, 10)
            : undefined;

          onChange({
            direction,
            value,
            unit,
          });
        }}
        placeholder="Number"
      />
      <Select
        dropdownId="unit-select"
        value={unit}
        onChange={(newUnit) =>
          onChange({
            direction: direction,
            value: value,
            unit: newUnit,
          })
        }
        options={RELATIVE_DATE_UNITS}
      />
    </StyledContainer>
  );
};
