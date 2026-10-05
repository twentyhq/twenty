import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// twenty-ui's Toggle is a base-ui Switch whose click handler constructs a
// PointerEvent, which the front component sandbox does not provide. This is
// the same control as a plain button, styled after twenty-ui's Toggle. The
// host theme squircles every corner, so the capsule and thumb opt out.
const TOGGLE_WIDTH_PIXELS = 32;
const TOGGLE_HEIGHT_PIXELS = 20;
const THUMB_SIZE_PIXELS = 16;
const THUMB_INSET_PIXELS = 2;

const CHECKED_THUMB_OFFSET_PIXELS =
  TOGGLE_WIDTH_PIXELS - THUMB_SIZE_PIXELS - THUMB_INSET_PIXELS;

const StyledToggle = styled.button`
  align-items: center;
  appearance: none;
  background-color: ${() => themeCssVariables.background.transparent.medium};
  border: none;
  border-radius: ${() => themeCssVariables.border.radius.pill};
  corner-shape: round;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: ${TOGGLE_HEIGHT_PIXELS}px;
  padding: 0;
  position: relative;
  transition: background-color
    calc(${() => themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${TOGGLE_WIDTH_PIXELS}px;

  &[data-checked='true'] {
    background-color: ${() => themeCssVariables.color.blue};
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;

const StyledThumb = styled.span`
  background-color: ${() => themeCssVariables.background.primary};
  border-radius: 50%;
  corner-shape: round;
  display: block;
  height: ${THUMB_SIZE_PIXELS}px;
  left: 0;
  position: absolute;
  top: 50%;
  transform: translate(${THUMB_INSET_PIXELS}px, -50%);
  transition: transform
    calc(${() => themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${THUMB_SIZE_PIXELS}px;

  &[data-checked='true'] {
    transform: translate(${CHECKED_THUMB_OFFSET_PIXELS}px, -50%);
  }
`;

type ToggleProps = {
  id?: string;
  checked: boolean;
  disabled?: boolean;
  ariaLabel: string;
  onChange: (checked: boolean) => void;
};

export const Toggle = ({
  id,
  checked,
  disabled = false,
  ariaLabel,
  onChange,
}: ToggleProps) => (
  <StyledToggle
    type="button"
    role="switch"
    id={id}
    aria-checked={checked ? 'true' : 'false'}
    aria-label={ariaLabel}
    data-checked={checked ? 'true' : 'false'}
    disabled={disabled}
    onClick={() => onChange(!checked)}
  >
    <StyledThumb data-checked={checked ? 'true' : 'false'} />
  </StyledToggle>
);
