import { useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type WorkflowAiAgentPermissionsObjectRowProps = {
  objectMetadata: {
    id: string;
    icon?: string | null;
    labelPlural: string;
  };
  onClick?: () => void;
  readonly: boolean;
};

export const WorkflowAiAgentPermissionsObjectRow = ({
  objectMetadata,
  onClick,
  readonly,
}: WorkflowAiAgentPermissionsObjectRowProps) => {
  const { getIcon } = useIcons();
  const IconComponent = getIcon(objectMetadata.icon);

  return (
    <MenuItem
      LeftIcon={IconComponent}
      withIconContainer
      text={objectMetadata.labelPlural}
      hasSubMenu={!readonly}
      onClick={!readonly ? onClick : undefined}
    />
  );
};
