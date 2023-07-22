import { useLocation } from 'react-router-dom';

export function useIsInSubMenu() {
  const currentPath = useLocation().pathname;
  return currentPath.match(/\/settings\//g) !== null;
}
