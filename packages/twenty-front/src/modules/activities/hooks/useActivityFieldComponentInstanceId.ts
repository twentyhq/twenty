import { useIsInSidePanelOrThrow } from '@/ui/layout/side-panel/contexts/SidePanelContext';

export const useActivityFieldComponentInstanceId = (
  baseComponentInstanceId: string,
) => {
  const { isInSidePanel } = useIsInSidePanelOrThrow();

  return isInSidePanel
    ? `${baseComponentInstanceId}-side-panel`
    : baseComponentInstanceId;
};
