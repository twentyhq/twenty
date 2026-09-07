import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CoreWorkflowFiltersBuilder } from '@/object-core/workflows/components/CoreWorkflowFiltersBuilder';
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
      <CoreWorkflowFiltersBuilder
        instanceId={CORE_WORKFLOWS_FILTER_INSTANCE_ID}
        defaultValue={coreWorkflowsFilterSettings}
        onFilterSettingsUpdate={setCoreWorkflowsFilterSettings}
      />
    </StyledPageContainer>
  );
};
