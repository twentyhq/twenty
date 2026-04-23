import { useLocation } from 'react-router-dom';

export const useIsSettingsPage = () =>
  useLocation().pathname.match(/\/settings\//g) !== null;
