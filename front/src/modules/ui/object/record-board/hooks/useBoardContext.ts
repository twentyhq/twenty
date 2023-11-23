import { useContext } from 'react';

import { BoardContext } from '@/companies/states/contexts/BoardContext';

export const useBoardContext = () => {
  return useContext(BoardContext);
};
