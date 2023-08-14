import { useContext } from 'react';

import { RowIdContext } from '../states/RowIdContext';

export function useCurrentRowEntityId() {
  const currentEntityId = useContext(RowIdContext);

  return currentEntityId;
}
