import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// twenty-ui's Toggle is a base-ui Switch whose click handler constructs a
// PointerEvent, which the front component sandbox does not provide. This is
// the same control as a plain button, styled after twenty-ui's Toggle.
export type ToggleSize = 'small' | 'medium';

type ToggleDimensions = {
  width: number;
  height: number;
  thumbSize: number;
};

const TOGGLE_DIMENSIONS_BY_SIZE: Record<ToggleSize, ToggleDimensions> = {
  small: { width: 24, height: 16, thumbSize: 12 },
  medium: { width: 32, height: 20, thumbSize: 16 },
};

const THUMB_INSET_PIXELS = 2;

const getThumbOffsetPixels = (
  { width, thumbSize }: ToggleDimensions,
  isChecked: boolean,
) => (isChecked ? width - thumbSize - THUMB_INSET_PIXELS : THUMB_INSET_PIXELS);

const StyledToggle = styled.button<{
  $isChecked: boolean;
  $toggleSize: ToggleSize;
}>`
  align-items: center;
  appearance: none;
  background-color: ${({ $isChecked }) =>
    $isChecked
      ? themeCssVariables.color.blue
      : themeCssVariables.background.transparent.medium};
  border: none;
  border-radius: ${() => themeCssVariables.border.radius.pill};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: ${({ $toggleSize }) => TOGGLE_DIMENSIONS_BY_SIZE[$toggleSize].height}px;
  padding: 0;
  position: relative;
  transition: background-color
    calc(${() => themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${({ $toggleSize }) => TOGGLE_DIMENSIONS_BY_SIZE[$toggleSize].width}px;

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;

const StyledThumb = styled.span<{
  $isChecked: boolean;
  $toggleSize: ToggleSize;
}>`
  background-color: ${() => themeCssVariables.background.primary};
  border-radius: 50%;
  display: block;
  height: ${({ $toggleSize }) =>
    TOGGLE_DIMENSIONS_BY_SIZE[$toggleSize].thumbSize}px;
  left: 0;
  position: absolute;
  top: 50%;
  transform: translate(
    ${({ $isChecked, $toggleSize }) =>
      getThumbOffsetPixels(TOGGLE_DIMENSIONS_BY_SIZE[$toggleSize], $isChecked)}px,
    -50%
  );
  transition: transform
    calc(${() => themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${({ $toggleSize }) =>
    TOGGLE_DIMENSIONS_BY_SIZE[$toggleSize].thumbSize}px;
`;

type ToggleProps = {
  id?: string;
  checked: boolean;
  disabled?: boolean;
  toggleSize?: ToggleSize;
  onChange: (checked: boolean) => void;
};

export const Toggle = ({
  id,
  checked,
  disabled = false,
  toggleSize = 'medium',
  onChange,
}: ToggleProps) => (
  <StyledToggle
    type="button"
    role="switch"
    id={id}
    aria-checked={checked}
    disabled={disabled}
    $isChecked={checked}
    $toggleSize={toggleSize}
    onClick={() => onChange(!checked)}
  >
    <StyledThumb $isChecked={checked} $toggleSize={toggleSize} />
  </StyledToggle>
);
