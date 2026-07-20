import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { IconCheck, IconCopy, type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const COPIED_STATE_RESET_DELAY_MS = 1500;
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
  successMessage: string;
  Icon?: IconComponent;
};

export const CopyToClipboardButton = ({
  textToCopy,
  ariaLabel,
  successMessage,
  Icon = IconCopy,
}: CopyToClipboardButtonProps) => {
  const [hasJustCopied, setHasJustCopied] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(
    () => () => {
      if (resetTimeoutRef.current !== undefined) {
        clearTimeout(resetTimeoutRef.current);
      }
    },
    [],
  );

  const isDisabled = textToCopy === undefined || textToCopy.length === 0;

  const handleClick = async () => {
    if (isDisabled) {
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);

      setHasJustCopied(true);
      if (resetTimeoutRef.current !== undefined) {
        clearTimeout(resetTimeoutRef.current);
      }
      resetTimeoutRef.current = setTimeout(() => {
        setHasJustCopied(false);
      }, COPIED_STATE_RESET_DELAY_MS);

      await enqueueSnackbar({ message: successMessage, variant: 'success' });
    } catch {
      await enqueueSnackbar({
        message: 'Could not copy to clipboard.',
        variant: 'error',
      });
    }
  };

  const DisplayedIcon = hasJustCopied ? IconCheck : Icon;

  return (
    <StyledButton
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={isDisabled}
      onClick={handleClick}
    >
      <DisplayedIcon size={COPY_ICON_SIZE} />
    </StyledButton>
  );
};
