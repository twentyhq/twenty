import { useLocation } from 'react-router-dom';

import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type UseTabListActiveTabIdArgs<TTabId extends string> = {
  componentInstanceId: string;
  visibleTabIds: TTabId[];
  defaultTabId?: string;
  behaveAsLinks?: boolean;
};

// Shared with TabList so a page can render the selected tab's content before TabList syncs its state
export const useTabListActiveTabId = <TTabId extends string>({
  componentInstanceId,
  visibleTabIds,
  defaultTabId,
  behaveAsLinks = true,
}: UseTabListActiveTabIdArgs<TTabId>): TTabId | null => {
  const location = useLocation();
  const workspaceSurface = useWorkspaceSurface();
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const findVisibleTabId = (tabId: string | null | undefined) =>
    visibleTabIds.find((visibleTabId) => visibleTabId === tabId);

  const routeTabId =
    behaveAsLinks && workspaceSurface.ownsRouteLocation
      ? findVisibleTabId(location.hash.replace('#', ''))
      : undefined;

  return (
    routeTabId ??
    findVisibleTabId(activeTabId) ??
    findVisibleTabId(defaultTabId) ??
    visibleTabIds[0] ??
    null
  );
};
