import { useIsCoreAgentsIndexPage } from '@/object-core/agents/hooks/useIsCoreAgentsIndexPage';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { coreAgentsSelectionState } from '@/object-core/agents/states/coreAgentsSelectionState';
import { getSelectedCoreAgentRowIds } from '@/object-core/agents/utils/getSelectedCoreAgentRowIds';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useSelectedCoreAgentIds = () => {
  const isCoreAgentsIndexPage = useIsCoreAgentsIndexPage();
  const coreAgentsSelection = useAtomStateValue(coreAgentsSelectionState);
  const coreAgentsFilterSettings = useAtomStateValue(
    coreAgentsFilterSettingsState,
  );

  return isCoreAgentsIndexPage
    ? getSelectedCoreAgentRowIds({
        selection: coreAgentsSelection,
        currentFilterSettings: coreAgentsFilterSettings,
      })
    : [];
};
