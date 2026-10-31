import { type FlatAgent } from '@/metadata-store/types/FlatAgent';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon';

type AgentMenuItemProps = {
  agent: Pick<FlatAgent, 'label' | 'icon'>;
  onClick: () => void;
};

export const AgentMenuItem = ({ agent, onClick }: AgentMenuItemProps) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(agent.icon || 'IconLego');

  return (
    <ListItemButton
      startIcon={
        <ListItemIconContainer>
          <Icon color={getActionIconColorOrThrow('AI_AGENT')} size={16} />
        </ListItemIconContainer>
      }
      onClick={onClick}
    >
      {agent.label}
    </ListItemButton>
  );
};
