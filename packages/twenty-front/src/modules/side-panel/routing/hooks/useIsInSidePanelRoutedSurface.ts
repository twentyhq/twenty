import { useSidePanelRoutedSurface } from '@/side-panel/routing/hooks/useSidePanelRoutedSurface';
import { isDefined } from 'twenty-shared/utils';

export const useIsInSidePanelRoutedSurface = () =>
  isDefined(useSidePanelRoutedSurface());
