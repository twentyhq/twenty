import styled from '@emotion/styled';
import { copyToClipboard } from 'twenty-sdk/front-component';
import { IconCopy, type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const COPY_ICON_SIZE = 16;

const StyledButton = styled.button`
  align-items: center;
  background: transparent;
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  color: ${() => themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  height: ${() => themeCssVariables.spacing[6]};
  justify-content: center;
  padding: 0 ${() => themeCssVariables.spacing[1]};
  transition: background 0.1s ease;
  width: ${() => themeCssVariables.spacing[6]};

  &:hover:not(:disabled) {
    background: ${() => themeCssVariables.background.tertiary};
  }

  &:disabled {
    color: ${() => themeCssVariables.font.color.light};
    cursor: not-allowed;
  }
`;

type CopyToClipboardButtonProps = {
  textToCopy: string | undefined;
  ariaLabel: string;
  Icon?: IconComponent;
};

export const CopyToClipboardButton = ({
  textToCopy,
  ariaLabel,
  Icon = IconCopy,
}: CopyToClipboardButtonProps) => {
  const isDisabled = textToCopy === undefined || textToCopy.length === 0;

  const handleClick = () => {
    if (isDisabled) {
      return;
    }

    // The host performs the clipboard write and owns the success/error
    // snackbar; the front-component sandbox has no direct navigator.clipboard
    // access, and the host does not report back whether the copy succeeded.
    void copyToClipboard(textToCopy);
  };

  return (
    <StyledButton
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={isDisabled}
      onClick={handleClick}
    >
      <Icon size={COPY_ICON_SIZE} />
    </StyledButton>
  );
};
