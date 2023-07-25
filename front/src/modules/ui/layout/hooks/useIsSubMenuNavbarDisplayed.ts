import { useLocation } from 'react-router-dom';

export function useIsSubMenuNavbarDisplayed() {
  const currentPath = useLocation().pathname;
  return currentPath.match(/\/settings\//g) !== null;
}
