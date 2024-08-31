import { useLocation } from 'react-router-dom';

/**
 * Custom hook to check if the current route matches the given path.
 * @param path The route to match.
 * @returns True if the current route matches the given path, false otherwise.
 */
export const useIsRoute = (path: string): boolean => {
  const location = useLocation();
  return location.pathname === path;
};
