import { usePageLayoutEditModeContext } from '@/page-layout/contexts/PageLayoutEditModeContext';

export const useIsPageLayoutInEditMode = () => {
  const { isInEditMode } = usePageLayoutEditModeContext();

  return isInEditMode;
};
