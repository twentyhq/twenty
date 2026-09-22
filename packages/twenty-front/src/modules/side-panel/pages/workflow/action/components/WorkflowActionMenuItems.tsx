import { ListItemIcon } from '@/ui/navigation/list-item/components/ListItemIcon';
import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
  const { getIcon } = useIcons();

  return (
    <>
      {actions.map((action) => {
        const Icon = getIcon(action.icon);

        return (
          <ListItem
            key={action.type}
            onClick={(event) => {
              event.preventDefault();
              onClick(action.type);
            }}
            startIcon={
              <ListItemIcon
                icon={() => (
                  <Icon
                    color={getActionIconColorOrThrow(action.type)}
                    size={16}
                  />
                )}
                container="soft"
              />
            }
          >
            {action.defaultLabel}
          </ListItem>
        );
      })}
    </>
  );
};
