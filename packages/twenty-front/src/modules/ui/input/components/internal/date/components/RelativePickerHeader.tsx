import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';

import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
  padding-bottom: 0;
`;

type RelativeDatePickerHeaderProps = {
  direction: string;
  value: string;
  unit: string;
  onDirectionChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onChange: (value: { direction: string; value: string; unit: string }) => void;
};

export const RelativeDatePickerHeader = ({
  direction,
  value,
  unit,
  onDirectionChange,
  onValueChange,
  onUnitChange,
}: RelativeDatePickerHeaderProps) => {
  return (
    <StyledContainer>
      <Select
        dropdownId="direction-select"
        value={direction}
        onChange={onDirectionChange}
        options={[
          { value: 'Past', label: 'Past' },
          { value: 'Next', label: 'Next' },
          { value: 'This', label: 'This' },
        ]}
      />
      <TextInput
        value={value}
        onChange={(value) => onValueChange(value?.toString() ?? '')}
        placeholder="Number"
      />
      <Select
        dropdownId="unit-select"
        value={unit}
        onChange={onUnitChange}
        options={[
          { value: 'Day', label: 'Day' },
          { value: 'Week', label: 'Week' },
          { value: 'Month', label: 'Month' },
          { value: 'Year', label: 'Year' },
        ]}
      />
    </StyledContainer>
  );
};
