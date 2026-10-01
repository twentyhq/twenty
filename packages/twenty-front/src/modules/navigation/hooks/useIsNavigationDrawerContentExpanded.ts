import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { useIsMobile } from 'twenty-ui/utilities';

// For the content (useNavigationDrawerExpanded is for the drawer container); mobile has no icon rail, so it always renders expanded there.
export const useIsNavigationDrawerContentExpanded = () => {
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useNavigationDrawerExpanded();

  return isNavigationDrawerExpanded || isMobile;
};
