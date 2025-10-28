import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { useTheme } from '@emotion/react';
import { useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type Action = {
  defaultLabel: string;
  type: WorkflowActionType;
  icon: string;
};

export const WorkflowActionMenuItems = ({
  actions,
  onClick,
}: {
  actions: Action[];
  onClick: (actionType: WorkflowActionType) => void;
}) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  return (
    <>
      {actions.map((action) => {
        const Icon = getIcon(action.icon);

        return (
          <MenuItem
            withIconContainer={true}
            key={action.type}
            LeftIcon={() => (
              <Icon
                color={getActionIconColorOrThrow({
                  theme,
                  actionType: action.type,
                })}
                size={16}
              />
            )}
            text={action.defaultLabel}
            onClick={() => onClick(action.type)}
          />
        );
      })}
    </>
  );
};
