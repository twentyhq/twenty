import { useContext } from 'react';

import { useRecoilScopedValue } from '@/ui/recoil-scope/hooks/useRecoilScopedValue';

import { currentRowEntityIdScopedState } from '../states/currentRowEntityIdScopedState';
import { RowContext } from '../states/RowContext';
import { RowIdContext } from '../states/RowIdContext';

export type TableDimensions = {
  numberOfColumns: number;
  numberOfRows: number;
};

export function useCurrentRowEntityId() {
  const currentEntityId = useContext(RowIdContext);

  // const currentRowEntityIdScoped = useRecoilScopedValue(
  //   currentRowEntityIdScopedState,
  //   RowContext,
  // );

  return currentEntityId;
}
