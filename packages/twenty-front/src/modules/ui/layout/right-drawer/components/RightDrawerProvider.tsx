import { ReactNode } from 'react';
import { RightDrawerContext } from '../contexts/RightDrawerContext';

type RightDrawerProviderProps = {
  children: ReactNode;
};

export const RightDrawerProvider = ({ children }: RightDrawerProviderProps) => {
  return (
    <RightDrawerContext.Provider value={{ isInRightDrawer: true }}>
      {children}
    </RightDrawerContext.Provider>
  );
};
