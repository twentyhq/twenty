import styled from '@emotion/styled';
import { IconCheck, IconMinus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// twenty-ui's Checkbox dispatches a PointerEvent the front-component sandbox does not provide.
const CHECKBOX_BOX_SIZE_PIXELS = 14;
const CHECKBOX_ICON_SIZE_PIXELS = 12;

const StyledCheckbox = styled.button`
  align-items: center;
  appearance: none;
  background: transparent;
  border: none;
  border-radius: ${() => themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: 5px;

  &:hover {
    background-color: ${() => themeCssVariables.background.transparent.light};
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:disabled:hover {
    background-color: transparent;
  }
`;

const StyledBox = styled.span`
  align-items: center;
  background: transparent;
  border: 1px solid ${() => themeCssVariables.border.color.inverted};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.inverted};
  display: flex;
  height: ${CHECKBOX_BOX_SIZE_PIXELS}px;
  justify-content: center;
  width: ${CHECKBOX_BOX_SIZE_PIXELS}px;

  &[data-checked='true'] {
    background: ${() => themeCssVariables.color.blue};
    border-color: ${() => themeCssVariables.color.blue};
  }

  &[data-disabled='true'] {
    border-color: ${() => themeCssVariables.border.color.strong};
  }

  &[data-disabled='true'][data-checked='true'] {
    background: ${() => themeCssVariables.color.blue7};
    border-color: ${() => themeCssVariables.color.blue7};
  }
`;

type CheckboxProps = {
  id?: string;
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  onChange: (checked: boolean) => void;
};

export const Checkbox = ({
  id,
  checked,
  indeterminate = false,
  disabled = false,
  'aria-label': ariaLabel,
  onChange,
}: CheckboxProps) => {
  const isFilled = checked || indeterminate;

  return (
    <StyledCheckbox
      type="button"
      role="checkbox"
      id={id}
      aria-checked={indeterminate ? 'mixed' : checked ? 'true' : 'false'}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <StyledBox
        data-checked={isFilled ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : 'false'}
      >
        {checked && <IconCheck size={CHECKBOX_ICON_SIZE_PIXELS} stroke={3} />}
        {!checked && indeterminate && (
          <IconMinus size={CHECKBOX_ICON_SIZE_PIXELS} stroke={3} />
        )}
      </StyledBox>
    </StyledCheckbox>
  );
};
