import { styled } from '@linaria/react';
import { isNonEmptyString } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadReasonBadge } from '@/ai/components/AiChatThreadReasonBadge';
import { useAgentChatThreadSubtitleContent } from '@/ai/hooks/useAgentChatThreadSubtitleContent';
import { useIsAgentChatThreadShownAsUnread } from '@/ai/hooks/useIsAgentChatThreadShownAsUnread';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

const StyledSubtitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  line-height: calc(
    ${themeCssVariables.spacing[4]} - ${themeCssVariables.spacing['0.5']}
  );
  min-height: calc(
    ${themeCssVariables.spacing[4]} - ${themeCssVariables.spacing['0.5']}
  );
  min-width: 0;
`;

const StyledPreview = styled.div`
  min-width: 0;
`;

type AiChatThreadSubtitleProps = {
  thread: AgentChatThreadRecord;
  size?: 'sm' | 'md';
};

export const AiChatThreadSubtitle = ({
  thread,
  size = 'sm',
}: AiChatThreadSubtitleProps) => {
  const isUnread = useIsAgentChatThreadShownAsUnread(thread);
  const { isAwaitingAnswer, hasDraft, previewText } =
    useAgentChatThreadSubtitleContent(thread);

  return (
    <Text
      render={<StyledSubtitle />}
      size={size}
      color={isUnread ? 'secondary' : 'tertiary'}
    >
      {isAwaitingAnswer && (
        <AiChatThreadReasonBadge reason="needsInput" isUnread={isUnread} />
      )}
      {isAwaitingAnswer && hasDraft && <span aria-hidden>·</span>}
      {hasDraft && <AiChatThreadReasonBadge reason="draft" />}
      {(isAwaitingAnswer || hasDraft) && isNonEmptyString(previewText) && (
        <span aria-hidden>·</span>
      )}
      <Text render={<StyledPreview />} truncate>
        {previewText}
      </Text>
    </Text>
  );
};
