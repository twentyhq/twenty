import { useLocation } from 'react-router-dom';

export const useIsTasksPage = () => useLocation().pathname === '/tasks';
