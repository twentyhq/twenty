import { useIsInSidePanelOrThrow } from '@/ui/layout/side-panel/contexts/SidePanelContext';

export const useActivityTargetsComponentInstanceId = (
  baseComponentInstanceId: string,
) => {
  const { isInRightDrawer } = useIsInSidePanelOrThrow();

  return isInRightDrawer
    ? `${baseComponentInstanceId}-right-drawer`
    : baseComponentInstanceId;
};
