import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { styled } from '@linaria/react';
import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledIconContainer = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: inline-flex;
  padding: ${themeCssVariables.spacing[1]};
`;

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
          <ListItemButton
            key={action.type}
            startIcon={
              <StyledIconContainer>
                <Icon
                  color={getActionIconColorOrThrow(action.type)}
                  size={16}
                />
              </StyledIconContainer>
            }
            disabled={action.disabled}
            description={action.contextualText}
            onClick={() => onClick(action.type)}
          >
            {t(action.defaultLabel)}
          </ListItemButton>
        );
      })}
    </>
  );
};
