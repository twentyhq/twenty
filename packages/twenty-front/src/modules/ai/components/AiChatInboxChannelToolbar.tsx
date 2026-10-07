import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SegmentedControl } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

const StyledToolbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
`;

type AiChatInboxChannelToolbarProps = {
  channelView: AgentChatChannelView;
};

export const AiChatInboxChannelToolbar = ({
  channelView,
}: AiChatInboxChannelToolbarProps) => {
  const { t } = useLingui();
  const setAgentChatChannelView = useSetAtomState(agentChatChannelViewState);

  return (
    <StyledToolbar>
      <SegmentedControl
        aria-label={t`Status`}
        itemWidth="content"
        value={channelView.channelStatus}
        onValueChange={(channelStatus: AgentChatChannelThreadStatus) =>
          setAgentChatChannelView({ ...channelView, channelStatus })
        }
        options={[
          { value: AgentChatChannelThreadStatus.OPEN, label: t`Open` },
          { value: AgentChatChannelThreadStatus.SNOOZED, label: t`Snoozed` },
          { value: AgentChatChannelThreadStatus.DONE, label: t`Done` },
        ]}
      />
      <SegmentedControl
        aria-label={t`Assignee`}
        itemWidth="content"
        value={channelView.assignment}
        onValueChange={(assignment: AgentChatChannelAssignmentFilter) =>
          setAgentChatChannelView({ ...channelView, assignment })
        }
        options={[
          { value: AgentChatChannelAssignmentFilter.ANY, label: t`All` },
          {
            value: AgentChatChannelAssignmentFilter.UNASSIGNED,
            label: t`Unassigned`,
          },
          {
            value: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
            label: t`Mine`,
          },
        ]}
      />
    </StyledToolbar>
  );
};
