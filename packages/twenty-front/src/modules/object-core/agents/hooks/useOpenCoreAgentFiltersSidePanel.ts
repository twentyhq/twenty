import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconFilter } from 'twenty-ui/icon';

export const useOpenCoreAgentFiltersSidePanel = () => {
  const { navigateSidePanel } = useNavigateSidePanel();
  const workspaceSurface = useContext(WorkspaceSurfaceContext);
  const scopeId = useRoutedFlowStateScopeId();
  const openCoreAgentFiltersSidePanel = ({
    resetNavigationStack = workspaceSurface.type === 'main',
    routedFlowStateScopeId = scopeId,
  }: {
    resetNavigationStack?: boolean;
    routedFlowStateScopeId?: string | null;
  } = {}) => {
    navigateSidePanel({
      page: SidePanelPages.AgentCoreFilters,
      pageTitle: t`Filter`,
      pageIcon: IconFilter,
      resetNavigationStack,
      routedFlowStateScopeId: routedFlowStateScopeId ?? undefined,
    });
  };
  return { openCoreAgentFiltersSidePanel };
};
