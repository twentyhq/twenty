import styled from '@emotion/styled';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { useDebouncedCallback } from 'use-debounce';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type SettingsAdminConfigCopyableTextProps = {
  text: string;
  displayText?: React.ReactNode;
  multiline?: boolean;
  maxRows?: number;
};

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
export const SettingsAdminConfigCopyableText = ({
  text,
  displayText,
  multiline = false,
  maxRows,
}: SettingsAdminConfigCopyableTextProps) => {
  const { copyToClipboard } = useCopyToClipboard();

  const copyToClipboardDebounced = useDebouncedCallback((value: string) => {
    copyToClipboard(value);
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
