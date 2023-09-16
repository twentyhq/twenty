import { useContext } from 'react';

import { RowIdContext } from '../contexts/RowIdContext';

export const useCurrentRowEntityId = () => {
  const currentEntityId = useContext(RowIdContext);

  return currentEntityId;
};
