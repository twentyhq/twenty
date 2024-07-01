import { useLocation } from 'react-router-dom';

export const useIsReportsPage = () =>
  useLocation().pathname.startsWith('/reports');
