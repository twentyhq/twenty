import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useInitializeQueryParamState } from '@/app/hooks/useInitializeQueryParamState';

export const InitializeQueryParamStateEffect = () => {
  const location = useLocation();
  const { initializeQueryParamState } = useInitializeQueryParamState();

  useEffect(() => {
    initializeQueryParamState();
  }, [initializeQueryParamState, location]);

  return null;
};
