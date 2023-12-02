import { useLocation } from 'react-router-dom';

export const useIsMenuNavbarDisplayed = () => {
  const currentPath = useLocation().pathname;
  return currentPath.match(/^\/companies(\/.*)?$/) !== null;
};
