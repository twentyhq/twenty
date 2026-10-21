import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { CoreObjectFiltersBuilder } from '@/object-core/filters/components/CoreObjectFiltersBuilder';
import { CORE_WORKFLOW_FILTER_FIELDS } from '@/object-core/workflows/constants/CoreWorkflowFilterFields';
import {
  CORE_WORKFLOWS_FILTER_INSTANCE_ID,
  coreWorkflowsFilterSettingsState,
} from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

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
      <CoreObjectFiltersBuilder
        instanceId={CORE_WORKFLOWS_FILTER_INSTANCE_ID}
        filterFields={CORE_WORKFLOW_FILTER_FIELDS}
        defaultValue={coreWorkflowsFilterSettings}
        onFilterSettingsUpdate={setCoreWorkflowsFilterSettings}
      />
    </StyledPageContainer>
  );
};
