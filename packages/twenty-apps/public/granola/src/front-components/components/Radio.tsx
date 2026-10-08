import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// twenty-ui's Radio is a base-ui control whose click handler constructs a
// PointerEvent, which the front component sandbox does not provide.
const RADIO_CONTROL_SIZE_PIXELS = 16;
const RADIO_INDICATOR_SIZE_PIXELS = 6;

const StyledRadio = styled.button`
  align-items: center;
  appearance: none;
  background: transparent;
  border: none;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  padding: 3px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.32;
  }
`;

const StyledControl = styled.span`
  align-items: center;
  background-color: transparent;
  border: 1px solid ${() => themeCssVariables.font.color.secondary};
  border-radius: 50%;
  box-sizing: border-box;
  corner-shape: round;
  display: inline-flex;
  height: ${RADIO_CONTROL_SIZE_PIXELS}px;
  justify-content: center;
  transition: transform
    calc(${() => themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${RADIO_CONTROL_SIZE_PIXELS}px;

  &[data-checked='true'] {
    background-color: ${() => themeCssVariables.color.blue};
    border-color: ${() => themeCssVariables.color.blue};
    transform: scale(1.05);
  }
`;

const StyledIndicator = styled.span`
  background-color: ${() => themeCssVariables.background.primary};
  border-radius: 50%;
  corner-shape: round;
  height: ${RADIO_INDICATOR_SIZE_PIXELS}px;
  width: ${RADIO_INDICATOR_SIZE_PIXELS}px;
`;

type RadioProps = {
  checked: boolean;
  disabled?: boolean;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  onSelect: () => void;
};

export const Radio = ({
  checked,
  disabled = false,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  onSelect,
}: RadioProps) => (
  <StyledRadio
    type="button"
    role="radio"
    aria-checked={checked ? 'true' : 'false'}
    aria-labelledby={ariaLabelledBy}
    aria-describedby={ariaDescribedBy}
    disabled={disabled}
    onClick={onSelect}
  >
    <StyledControl data-checked={checked ? 'true' : 'false'}>
      {checked && <StyledIndicator />}
    </StyledControl>
  </StyledRadio>
);
