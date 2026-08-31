import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CoreWorkflowFilterFieldSelect } from '@/object-core/workflows/components/CoreWorkflowFilterFieldSelect';
import { CoreWorkflowFilterValueInput } from '@/object-core/workflows/components/CoreWorkflowFilterValueInput';
import {
  CORE_WORKFLOWS_FILTER_INSTANCE_ID,
  coreWorkflowsFilterSettingsState,
} from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { WorkflowStepFilterBuilder } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterBuilder';

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[2]};
`;

export const SidePanelCoreWorkflowFiltersPage = () => {
  const [coreWorkflowsFilterSettings, setCoreWorkflowsFilterSettings] =
    useAtomState(coreWorkflowsFilterSettingsState);

  return (
    <StyledPageContainer>
      <WorkflowStepFilterBuilder
        instanceId={CORE_WORKFLOWS_FILTER_INSTANCE_ID}
        defaultValue={coreWorkflowsFilterSettings}
        onFilterSettingsUpdate={setCoreWorkflowsFilterSettings}
        FieldSelectComponent={CoreWorkflowFilterFieldSelect}
        ValueInputComponent={CoreWorkflowFilterValueInput}
        canAddFilterGroups={false}
      />
    </StyledPageContainer>
  );
};
