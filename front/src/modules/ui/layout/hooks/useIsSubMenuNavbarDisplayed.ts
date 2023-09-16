import { useLocation } from 'react-router-dom';

export const useIsSubMenuNavbarDisplayed = () => {
  const currentPath = useLocation().pathname;
  return currentPath.match(/\/settings\//g) !== null;
};
