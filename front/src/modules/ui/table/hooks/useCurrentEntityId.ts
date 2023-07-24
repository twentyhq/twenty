import { useContext } from 'react';

import { RowIdContext } from '../states/RowIdContext';

export type TableDimensions = {
  numberOfColumns: number;
  numberOfRows: number;
};

export function useCurrentRowEntityId() {
  const currentEntityId = useContext(RowIdContext);

  return currentEntityId;
}
