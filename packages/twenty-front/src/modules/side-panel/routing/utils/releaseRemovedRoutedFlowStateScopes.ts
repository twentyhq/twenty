import { type SidePanelNavigationStackItem } from '@/side-panel/states/sidePanelNavigationStackState';
import { releaseRoutedFlowStateScope } from '@/ui/utilities/state/jotai/utils/routedFlowStateScopeRegistry';
import { isDefined } from 'twenty-shared/utils';

export const releaseRemovedRoutedFlowStateScopes = ({
  removedItems,
  remainingItems,
}: {
  removedItems: SidePanelNavigationStackItem[];
  remainingItems: SidePanelNavigationStackItem[];
}) => {
  const remainingScopeIds = new Set(
    remainingItems.map((item) => item.routedFlowStateScopeId).filter(isDefined),
  );
  const removedScopeIds = new Set(
    removedItems.map((item) => item.routedFlowStateScopeId).filter(isDefined),
  );

  removedScopeIds.forEach((scopeId) => {
    if (!remainingScopeIds.has(scopeId)) {
      releaseRoutedFlowStateScope(scopeId);
    }
  });
};
