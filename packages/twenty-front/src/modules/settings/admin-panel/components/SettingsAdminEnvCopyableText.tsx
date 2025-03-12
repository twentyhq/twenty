import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconCopy, OverflowingTextWithTooltip } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

const StyledEllipsisLabel = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledExpandedEllipsisLabel = styled.div`
  white-space: normal;
  word-break: break-all;
`;

const StyledCopyContainer = styled.span`
  cursor: pointer;
`;
export const SettingsAdminEnvCopyableText = ({
  text,
  displayText,
  multiline = false,
  maxRows,
}: {
  text: string;
  displayText?: React.ReactNode;
  multiline?: boolean;
  maxRows?: number;
}) => {
  const { enqueueSnackBar } = useSnackBar();
  const theme = useTheme();
  const { t } = useLingui();

  const copyToClipboardDebounced = useDebouncedCallback((value: string) => {
    navigator.clipboard.writeText(value);
    enqueueSnackBar(t`Copied to clipboard!`, {
      variant: SnackBarVariant.Success,
      icon: <IconCopy size={theme.icon.size.md} />,
    });
  }, 200);

  return (
    <StyledCopyContainer onClick={() => copyToClipboardDebounced(text)}>
      {maxRows ? (
        <OverflowingTextWithTooltip
          text={displayText?.toString() || text}
          displayedMaxRows={maxRows}
          isTooltipMultiline={multiline}
        />
      ) : multiline ? (
        <StyledExpandedEllipsisLabel>
          {displayText || text}
        </StyledExpandedEllipsisLabel>
      ) : (
        <StyledEllipsisLabel>{displayText || text}</StyledEllipsisLabel>
      )}
    </StyledCopyContainer>
  );
};
