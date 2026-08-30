import { isDefined } from 'twenty-shared/utils';

import { useIsInSidePanelRoutedSurface } from '@/side-panel/routing/hooks/useIsInSidePanelRoutedSurface';
import { getSurfaceScopedComponentInstanceId } from '@/side-panel/routing/utils/getSurfaceScopedComponentInstanceId';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';

// A page rendered on both outlets at once would otherwise share the state its
// constant instance id points at, so the same tab would be selected on both.
export const useSurfaceScopedComponentInstanceId = (instanceId: string) => {
  const isInSidePanelRoutedSurface = useIsInSidePanelRoutedSurface();
  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  if (!isInSidePanelRoutedSurface || !isDefined(sidePanelPageInstanceId)) {
    return instanceId;
  }

  return getSurfaceScopedComponentInstanceId(
    instanceId,
    sidePanelPageInstanceId,
  );
};
