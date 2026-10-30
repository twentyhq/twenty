import { type AgentTrigger } from 'twenty-shared/application';
import { ListItemButton } from 'twenty-ui/components/navigation';

import { CoreAgentTriggerTypeIcon } from '@/object-core/agents/components/CoreAgentTriggerTypeIcon';
import { getCoreAgentTriggerTypeLabelAndIcon } from '@/object-core/agents/utils/getCoreAgentTriggerTypeLabelAndIcon';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';

type CoreAgentTriggerTypeItemProps = {
  trigger: AgentTrigger;
  onClick: () => void;
};

export const CoreAgentTriggerTypeItem = ({
  trigger,
  onClick,
}: CoreAgentTriggerTypeItemProps) => (
  <ListItemButton
    startIcon={
      <ListItemIconContainer>
        <CoreAgentTriggerTypeIcon trigger={trigger} />
      </ListItemIconContainer>
    }
    onClick={onClick}
  >
    {getCoreAgentTriggerTypeLabelAndIcon(trigger).label}
  </ListItemButton>
);
