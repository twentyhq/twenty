import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { useIsMobile } from 'twenty-ui/utilities';

// Mobile has no icon rail, so the content always renders expanded there.
export const useIsNavigationDrawerContentExpanded = () => {
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useNavigationDrawerExpanded();

  return isNavigationDrawerExpanded || isMobile;
};
