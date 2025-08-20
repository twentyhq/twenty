import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { useIcons } from 'twenty-ui/display';
import { MenuItemCommand } from 'twenty-ui/navigation';

type Action = { type: WorkflowActionType; label: string; icon: string };

export const WorkflowActionMenuItems = (
  actions: Action[],
  theme: any,
  onClick: (actionType: WorkflowActionType) => void,
) => {
  const { getIcon } = useIcons();
  return actions.map((action) => {
    const Icon = getIcon(action.icon);
    return (
      <MenuItemCommand
        key={action.type}
        LeftIcon={() => (
          <Icon
            color={getActionIconColorOrThrow({
              theme,
              actionType: action.type,
            })}
          />
        )}
        text={action.label}
        onClick={() => onClick(action.type)}
      />
    );
  });
};
