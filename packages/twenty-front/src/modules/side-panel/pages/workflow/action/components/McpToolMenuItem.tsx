import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { IconSparkles } from 'twenty-ui/icon';

type McpToolMenuItemProps = {
  label: string;
  description: string | null;
  onClick: () => void;
};

export const McpToolMenuItem = ({
  label,
  description,
  onClick,
}: McpToolMenuItemProps) => (
  <ListItemButton
    startIcon={
      <ListItemIconContainer>
        <IconSparkles color={getActionIconColorOrThrow('MCP_TOOL')} size={16} />
      </ListItemIconContainer>
    }
    description={description ?? undefined}
    onClick={onClick}
  >
    {label}
  </ListItemButton>
);
