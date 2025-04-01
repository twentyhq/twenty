import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { OTHER_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/OtherActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { MenuItemCommand, useIcons } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const CommandMenuWorkflowSelectActionContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const { getIcon } = useIcons();
  const { createStep } = useCreateStep({
    workflow,
  });
  const isWorkflowFormActionEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowFormActionEnabled,
  );

  return (
    <RightDrawerStepListContainer>
      <RightDrawerWorkflowSelectStepTitle>
        Records
      </RightDrawerWorkflowSelectStepTitle>
      {RECORD_ACTIONS.map((action) => (
        <MenuItemCommand
          key={action.type}
          LeftIcon={getIcon(action.icon)}
          text={action.label}
          onClick={() => createStep(action.type)}
        />
      ))}
      <RightDrawerWorkflowSelectStepTitle>
        Other
      </RightDrawerWorkflowSelectStepTitle>
      {OTHER_ACTIONS.filter(
        (action) => isWorkflowFormActionEnabled || action.type !== 'FORM',
      ).map((action) => (
        <MenuItemCommand
          key={action.type}
          LeftIcon={getIcon(action.icon)}
          text={action.label}
          onClick={() => createStep(action.type)}
        />
      ))}
    </RightDrawerStepListContainer>
  );
};
