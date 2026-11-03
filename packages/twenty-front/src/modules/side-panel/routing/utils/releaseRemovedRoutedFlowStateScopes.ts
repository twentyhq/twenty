import { type SidePanelNavigationStackItem } from '@/side-panel/states/sidePanelNavigationStackState';
import { routedFlowStateScopeRegistry } from '@/ui/utilities/state/jotai/utils/routedFlowStateScopeRegistry';
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

  for (const scopeId of removedScopeIds) {
    if (remainingScopeIds.has(scopeId)) {
      continue;
    }

    routedFlowStateScopeRegistry.release(scopeId);
  }
};
