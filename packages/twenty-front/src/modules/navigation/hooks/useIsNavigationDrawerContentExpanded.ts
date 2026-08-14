import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

// Whether the navigation content renders its full width rather than the icon
// rail. Mobile has no rail: the content is either a full-width drawer or the
// home page, so it always renders expanded there. Use this for the content,
// and useNavigationDrawerExpanded for the drawer container itself.
export const useIsNavigationDrawerContentExpanded = () => {
  const isMobile = useIsMobile();
  const isNavigationDrawerExpanded = useNavigationDrawerExpanded();

  return isNavigationDrawerExpanded || isMobile;
};
