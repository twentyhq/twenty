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
    startIcon={<IconSparkles size={16} />}
    description={description ?? undefined}
    onClick={onClick}
  >
    {label}
  </ListItemButton>
);
