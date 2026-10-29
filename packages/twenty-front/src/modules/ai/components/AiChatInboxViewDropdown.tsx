import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconChevronDown } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AGENT_CHAT_OPEN_THREAD_FILTER_STATUSES } from '@/ai/constants/AgentChatOpenThreadFilterStatuses';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { useAgentChatOpenThreadsSummary } from '@/ai/hooks/useAgentChatOpenThreadsSummary';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const StyledHeading = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  white-space: nowrap;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

type AiChatInboxViewDropdownProps = {
  selectedThreadCount?: number;
};

export const AiChatInboxViewDropdown = ({
  selectedThreadCount = 0,
}: AiChatInboxViewDropdownProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const { formatNumber } = useNumberFormat();
  const [agentChatThreadFilterStatus, setAgentChatThreadFilterStatus] =
    useAtomState(agentChatThreadFilterStatusState);
  const { openThreadCount, needsInputThreadCount } =
    useAgentChatOpenThreadsSummary();
  const { resetRecordSelection } = useResetRecordSelection();
  const FilterIcon =
    AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[agentChatThreadFilterStatus];
  const filterLabel = t(
    AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[agentChatThreadFilterStatus],
  );
  const countByFilterStatus: Partial<
    Record<AgentChatThreadFilterStatus, number>
  > = {
    [AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE]: openThreadCount,
    [AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT]: needsInputThreadCount,
  };

  const handleSelect = (nextFilterStatus: AgentChatThreadFilterStatus) => {
    resetRecordSelection();
    setAgentChatThreadFilterStatus(nextFilterStatus);
  };

  return (
    <StyledHeading>
      <DropdownRoot dropdownId={`ai-chat-inbox-view-${instanceId}`} type="menu">
        <Dropdown.Trigger
          render={
            <Button
              size="sm"
              variant="ghost"
              color="neutral"
              startIcon={<FilterIcon />}
              endIcon={<IconChevronDown />}
              aria-label={t`Filter inbox chats: ${filterLabel}`}
            >
              {filterLabel}
            </Button>
          }
        />
        <DropdownContent align="start" aria-label={t`Filter inbox chats`}>
          <Dropdown.Section>
            {AGENT_CHAT_OPEN_THREAD_FILTER_STATUSES.map((status) => {
              const StatusIcon = AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[status];
              const count = countByFilterStatus[status];

              return (
                <Dropdown.OptionItem
                  key={status}
                  startIcon={<StatusIcon />}
                  endIcon={
                    isDefined(count) && count > 0 ? (
                      <StyledCount>{formatNumber(count)}</StyledCount>
                    ) : undefined
                  }
                  selected={status === agentChatThreadFilterStatus}
                  onSelect={() => handleSelect(status)}
                  render={
                    <Link
                      to={getAppPath(AppPath.AiChatInbox, { threadId: null })}
                    />
                  }
                >
                  {t(AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[status])}
                </Dropdown.OptionItem>
              );
            })}
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
      {selectedThreadCount > 0 && (
        <>
          <span aria-hidden>→</span>
          <StyledCount>
            {t`${formatNumber(selectedThreadCount)} selected`}
          </StyledCount>
        </>
      )}
    </StyledHeading>
  );
};
