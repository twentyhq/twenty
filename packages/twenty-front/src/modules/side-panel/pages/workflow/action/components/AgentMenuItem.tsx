import { CoreAgentAvatar } from '@/object-core/agents/components/CoreAgentAvatar';
import { type FlatAgent } from '@/metadata-store/types/FlatAgent';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { useTheme } from 'twenty-ui/theme';

type AgentMenuItemProps = {
  agent: Pick<
    FlatAgent,
    'id' | 'label' | 'icon' | 'avatarColor' | 'avatarShape'
  >;
  onClick: () => void;
};

export const AgentMenuItem = ({ agent, onClick }: AgentMenuItemProps) => {
  const theme = useTheme();

  return (
    <ListItemButton
      startIcon={
        <ListItemIconContainer>
          <CoreAgentAvatar agent={agent} size={theme.icon.size.md} />
        </ListItemIconContainer>
      }
      onClick={onClick}
    >
      {agent.label}
    </ListItemButton>
  );
};
