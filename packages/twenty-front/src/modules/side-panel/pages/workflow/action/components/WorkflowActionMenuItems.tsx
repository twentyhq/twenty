import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { useIcons } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/primitives/navigation';

type Action = {
  defaultLabel: string;
  type: WorkflowActionType;
  icon: string;
  disabled?: boolean;
  contextualText?: string;
  tooltip?: string;
};

export const WorkflowActionMenuItems = ({
  actions,
  onClick,
}: {
  actions: Action[];
  onClick: (actionType: WorkflowActionType) => void;
}) => {
  const { getIcon } = useIcons();

  return (
    <>
      {actions.map((action) => {
        const Icon = getIcon(action.icon);

        const menuItem = (
          <MenuItem
            withIconContainer={true}
            key={action.type}
            LeftIcon={() => (
              <Icon color={getActionIconColorOrThrow(action.type)} size={16} />
            )}
            disabled={action.disabled}
            text={action.defaultLabel}
            contextualText={action.contextualText}
            onClick={() => onClick(action.type)}
          />
        );

        return action.tooltip ? (
          <Tooltip key={action.type} content={action.tooltip} side="left">
            <div>{menuItem}</div>
          </Tooltip>
        ) : (
          menuItem
        );
      })}
    </>
  );
};
