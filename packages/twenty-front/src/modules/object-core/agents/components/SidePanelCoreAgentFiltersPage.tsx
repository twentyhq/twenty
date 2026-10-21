import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { CORE_AGENT_FILTER_FIELDS } from '@/object-core/agents/constants/CoreAgentFilterFields';
import {
  CORE_AGENTS_FILTER_INSTANCE_ID,
  coreAgentsFilterSettingsState,
} from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { CoreObjectFiltersBuilder } from '@/object-core/filters/components/CoreObjectFiltersBuilder';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[2]};
`;

export const SidePanelCoreAgentFiltersPage = () => {
  const [coreAgentsFilterSettings, setCoreAgentsFilterSettings] = useAtomState(
    coreAgentsFilterSettingsState,
  );

  return (
    <StyledPageContainer>
      <CoreObjectFiltersBuilder
        instanceId={CORE_AGENTS_FILTER_INSTANCE_ID}
        filterFields={CORE_AGENT_FILTER_FIELDS}
        defaultValue={coreAgentsFilterSettings}
        onFilterSettingsUpdate={setCoreAgentsFilterSettings}
      />
    </StyledPageContainer>
  );
};
