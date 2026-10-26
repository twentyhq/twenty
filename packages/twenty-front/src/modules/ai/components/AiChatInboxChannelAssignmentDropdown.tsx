import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconFilter } from 'twenty-ui/icon';

import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { AgentChatChannelAssignmentFilter } from '~/generated-metadata/graphql';

type AiChatInboxChannelAssignmentDropdownProps = {
  channelView: AgentChatChannelView;
};

export const AiChatInboxChannelAssignmentDropdown = ({
  channelView,
}: AiChatInboxChannelAssignmentDropdownProps) => {
  const { t } = useLingui();
  const instanceId = useId();
  const setAgentChatChannelView = useSetAtomState(agentChatChannelViewState);
  const { resetRecordSelection } = useResetRecordSelection();
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

  return (
    <DropdownRoot
      dropdownId={`ai-chat-channel-assignment-${instanceId}`}
      type="menu"
    >
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
            aria-label={t`Filter chats by assignee`}
          >
            <IconFilter />
          </IconButton>
        }
      />
      <DropdownContent align="end" aria-label={t`Assignee`}>
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
