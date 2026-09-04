import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// twenty-ui's Toggle is a base-ui Switch whose click handler constructs a
// PointerEvent, which the front component sandbox does not provide. This is
// the same control as a plain button, styled after twenty-ui's Toggle. The
// host theme squircles every corner, so the capsule and thumb opt out.
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

const getCheckedThumbOffsetPixels = ({ width, thumbSize }: ToggleDimensions) =>
  width - thumbSize - THUMB_INSET_PIXELS;

const StyledToggle = styled.button<{
  $toggleSize: ToggleSize;
}>`
  align-items: center;
  appearance: none;
  background-color: ${() => themeCssVariables.background.transparent.medium};
  border: none;
  border-radius: ${() => themeCssVariables.border.radius.pill};
  corner-shape: round;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: ${({ $toggleSize }) =>
    TOGGLE_DIMENSIONS_BY_SIZE[$toggleSize].height}px;
  padding: 0;
  position: relative;
  transition: background-color
    calc(${() => themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${({ $toggleSize }) => TOGGLE_DIMENSIONS_BY_SIZE[$toggleSize].width}px;

  &[data-checked='true'] {
    background-color: ${() => themeCssVariables.color.blue};
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;

const StyledThumb = styled.span<{
  $toggleSize: ToggleSize;
}>`
  background-color: ${() => themeCssVariables.background.primary};
  border-radius: 50%;
  corner-shape: round;
  display: block;
  height: ${({ $toggleSize }) =>
    TOGGLE_DIMENSIONS_BY_SIZE[$toggleSize].thumbSize}px;
  left: 0;
  position: absolute;
  top: 50%;
  transform: translate(${THUMB_INSET_PIXELS}px, -50%);
  transition: transform
    calc(${() => themeCssVariables.animation.duration.normal} * 1s) ease;
  width: ${({ $toggleSize }) =>
    TOGGLE_DIMENSIONS_BY_SIZE[$toggleSize].thumbSize}px;

  &[data-checked='true'] {
    transform: translate(
      ${({ $toggleSize }) =>
        getCheckedThumbOffsetPixels(TOGGLE_DIMENSIONS_BY_SIZE[$toggleSize])}px,
      -50%
    );
  }
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
    aria-checked={checked ? 'true' : 'false'}
    data-checked={checked ? 'true' : 'false'}
    disabled={disabled}
    $toggleSize={toggleSize}
    onClick={() => onChange(!checked)}
  >
    <StyledThumb
      data-checked={checked ? 'true' : 'false'}
      $toggleSize={toggleSize}
    />
  </StyledToggle>
);
