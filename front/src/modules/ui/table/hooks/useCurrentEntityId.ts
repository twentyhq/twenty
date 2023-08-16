import { useContext } from 'react';

import { RowIdContext } from '../contexts/RowIdContext';

export function useCurrentRowEntityId() {
  const currentEntityId = useContext(RowIdContext);

  return currentEntityId;
}
