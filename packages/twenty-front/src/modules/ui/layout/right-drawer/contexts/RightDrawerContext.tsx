import { createContext } from 'react';

type RightDrawerContextType = {
  isInRightDrawer: boolean;
};

export const RightDrawerContext = createContext<RightDrawerContextType>({
  isInRightDrawer: false,
});
