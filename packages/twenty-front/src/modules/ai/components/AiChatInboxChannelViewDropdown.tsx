import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconFilter } from 'twenty-ui/icon';

import { AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS } from '@/ai/constants/AgentChatChannelNavigationItems';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { getAgentChatChannelNavigationItemOrThrow } from '@/ai/utils/getAgentChatChannelNavigationItemOrThrow';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { AgentChatChannelAssignmentFilter } from '~/generated-metadata/graphql';

type AiChatInboxChannelViewDropdownProps = {
  channelView: AgentChatChannelView;
};

export const AiChatInboxChannelViewDropdown = ({
  channelView,
}: AiChatInboxChannelViewDropdownProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const setAgentChatChannelView = useSetAtomState(agentChatChannelViewState);
  const { resetRecordSelection } = useResetRecordSelection();
  const selectedNavigationItem =
    getAgentChatChannelNavigationItemOrThrow(channelView);
  const assignmentOptions = [
    { value: AgentChatChannelAssignmentFilter.ANY, label: t`All` },
    {
      value: AgentChatChannelAssignmentFilter.UNASSIGNED,
      label: t`Unassigned`,
    },
    { value: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME, label: t`Mine` },
  ];

  const handleAssignmentSelect = (
    assignment: AgentChatChannelAssignmentFilter,
  ) => {
    resetRecordSelection();
    setAgentChatChannelView({ ...channelView, assignment });
  };

  const handleViewSelect = ({
    channelStatus,
    assignment,
  }: Pick<AgentChatChannelView, 'channelStatus' | 'assignment'>) => {
    resetRecordSelection();
    setAgentChatChannelView({ ...channelView, channelStatus, assignment });
  };

  return (
    <DropdownRoot dropdownId={`ai-chat-channel-view-${instanceId}`} type="menu">
      <Dropdown.Trigger
        render={
          <IconButton
            size="sm"
            variant="outline"
            color={
              channelView.assignment === AgentChatChannelAssignmentFilter.ANY
                ? 'neutral'
                : 'accent'
            }
            aria-label={t`Filter channel chats`}
          >
            <IconFilter />
          </IconButton>
        }
      />
      <DropdownContent align="end" aria-label={t`Filter channel chats`}>
        <Dropdown.Section label={t`View`}>
          {AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS.map((navigationItem) => (
            <Dropdown.OptionItem
              key={navigationItem.label.id}
              startIcon={<navigationItem.Icon />}
              selected={navigationItem === selectedNavigationItem}
              onSelect={() => handleViewSelect(navigationItem)}
            >
              {t(navigationItem.label)}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
        <Dropdown.Section label={t`Assignee`}>
          {assignmentOptions.map(({ value, label }) => (
            <Dropdown.OptionItem
              key={value}
              selected={value === channelView.assignment}
              onSelect={() => handleAssignmentSelect(value)}
            >
              {label}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
