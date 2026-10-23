import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from 'twenty-shared/utils';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { useIsAgentChatThreadShownAsUnread } from '@/ai/hooks/useIsAgentChatThreadShownAsUnread';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

const StyledTitle = styled.div`
  flex: 1;
  line-height: ${themeCssVariables.spacing[4]};
  min-width: 0;
`;

type AiChatThreadTitleProps = {
  thread: AgentChatThreadRecord;
};

export const AiChatThreadTitle = ({ thread }: AiChatThreadTitleProps) => {
  const { t } = useLingui();
  const isUnread = useIsAgentChatThreadShownAsUnread(thread);

  return (
    <Text
      render={<StyledTitle />}
      size="md"
      weight={isUnread ? 'semibold' : 'regular'}
      color="primary"
      truncate
    >
      {isNonEmptyString(thread.title) ? thread.title : t`Untitled`}
      {isUnread && <VisuallyHidden>{t`, unread`}</VisuallyHidden>}
    </Text>
  );
};
