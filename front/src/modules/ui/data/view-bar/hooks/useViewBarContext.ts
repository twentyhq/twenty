import { useContext } from 'react';

import { ViewBarContext } from '../contexts/ViewBarContext';

export const useViewBarContext = () => {
  return useContext(ViewBarContext);
};
