import { useLocation } from 'react-router-dom';

export const useIsOnboarding = () => {
  const location = useLocation();
  return (
    /^\/welcome(\/)?$/.test(location.pathname) ||
    /^\/create\/workspace(\/)?$/.test(location.pathname) ||
    /^\/create\/profile(\/)?$/.test(location.pathname)
  );
};
