import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from 'twenty-shared/utils';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { themeCssVariables } from 'twenty-ui/theme';

import { useIsAgentChatThreadShownAsUnread } from '@/ai/hooks/useIsAgentChatThreadShownAsUnread';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

const StyledTitle = styled.div<{ $isUnread: boolean }>`
  color: ${({ $isUnread }) =>
    $isUnread
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${({ $isUnread }) =>
    $isUnread
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.medium};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type AiChatThreadTitleProps = {
  thread: AgentChatThreadRecord;
};

export const AiChatThreadTitle = ({ thread }: AiChatThreadTitleProps) => {
  const { t } = useLingui();
  const isUnread = useIsAgentChatThreadShownAsUnread(thread);

  return (
    <StyledTitle $isUnread={isUnread}>
      {isNonEmptyString(thread.title) ? thread.title : t`Untitled`}
      {isUnread && <VisuallyHidden>{t`, unread`}</VisuallyHidden>}
    </StyledTitle>
  );
};
