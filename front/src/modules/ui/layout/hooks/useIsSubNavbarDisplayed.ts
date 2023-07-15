import { useLocation } from 'react-router-dom';

export function useIsSubNavbarDisplayed() {
  const currentPath = useLocation().pathname;
  return currentPath.match(/\/settings\//g) !== null;
}
