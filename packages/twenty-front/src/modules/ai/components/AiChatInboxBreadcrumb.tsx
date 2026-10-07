import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledBreadcrumb = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

export const AiChatInboxBreadcrumb = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const FilterStatusIcon =
    AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[agentChatThreadFilterStatus];

  return (
    <UndecoratedLink to={getAppPath(AppPath.AiChatInbox, { threadId: null })}>
      <StyledBreadcrumb>
        <FilterStatusIcon size={theme.icon.size.md} />
        {t(AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[agentChatThreadFilterStatus])}
        <span aria-hidden>/</span>
      </StyledBreadcrumb>
    </UndecoratedLink>
  );
};
