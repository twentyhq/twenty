import { useIsInRightDrawerOrThrow } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';

export const useActivityTargetsComponentInstanceId = (
  baseComponentInstanceId: string,
) => {
  const { isInRightDrawer } = useIsInRightDrawerOrThrow();

  return isInRightDrawer
    ? `${baseComponentInstanceId}-right-drawer`
    : baseComponentInstanceId;
};
