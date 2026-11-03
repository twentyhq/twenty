import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSegmentedControl = styled.div`
  background-color: ${() => themeCssVariables.background.transparent.light};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  display: inline-flex;
  gap: 2px;
  padding: 2px;
`;

const StyledSegment = styled.button`
  appearance: none;
  background: transparent;
  border: none;
  border-radius: ${() => themeCssVariables.border.radius.xs};
  color: ${() => themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  min-width: ${() => themeCssVariables.spacing[8]};
  padding: ${() => themeCssVariables.spacing[1]}
    ${() => themeCssVariables.spacing[2]};

  &:hover {
    color: ${() => themeCssVariables.font.color.secondary};
  }

  &[aria-checked='true'] {
    background-color: ${() => themeCssVariables.background.primary};
    box-shadow: ${() => themeCssVariables.boxShadow.light};
    color: ${() => themeCssVariables.font.color.primary};
  }
`;

export type SegmentedControlOption<TValue extends string | number> = {
  value: TValue;
  label: string;
};

type SegmentedControlProps<TValue extends string | number> = {
  options: SegmentedControlOption<TValue>[];
  value: TValue;
  'aria-labelledby'?: string;
  onChange: (value: TValue) => void;
};

export const SegmentedControl = <TValue extends string | number>({
  options,
  value,
  'aria-labelledby': ariaLabelledBy,
  onChange,
}: SegmentedControlProps<TValue>) => (
  <StyledSegmentedControl role="radiogroup" aria-labelledby={ariaLabelledBy}>
    {options.map((option) => (
      <StyledSegment
        key={option.value}
        type="button"
        role="radio"
        aria-checked={option.value === value ? 'true' : 'false'}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </StyledSegment>
    ))}
  </StyledSegmentedControl>
);
