import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';
import { MenuItem } from 'twenty-ui/components';
import { useIcons } from 'twenty-ui/icon';

type Action = {
  defaultLabel: MessageDescriptor;
  type: WorkflowActionType;
  icon: string;
  disabled?: boolean;
  contextualText?: string;
};

export const WorkflowActionMenuItems = ({
  actions,
  onClick,
}: {
  actions: Action[];
  onClick: (actionType: WorkflowActionType) => void;
}) => {
  const { t } = useLingui();
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
              <Icon color={getActionIconColorOrThrow(action.type)} size={16} />
            )}
            disabled={action.disabled}
            text={t(action.defaultLabel)}
            contextualText={action.contextualText}
            onClick={() => onClick(action.type)}
          />
        );
      })}
    </>
  );
};
