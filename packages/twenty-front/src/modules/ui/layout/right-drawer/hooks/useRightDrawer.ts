import { useContext } from 'react';
import { RightDrawerContext } from '../contexts/RightDrawerContext';

export const useIsInRightDrawer = () => {
  const context = useContext(RightDrawerContext);

  if (context === undefined) {
    throw new Error(
      'useIsInRightDrawer must be used within a RightDrawerProvider',
    );
  }

  return context;
};
