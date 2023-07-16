import { useRecoilScopedValue } from '@/ui/recoil-scope/hooks/useRecoilScopedValue';

import { currentRowEntityIdScopedState } from '../states/currentRowEntityIdScopedState';
import { RowContext } from '../states/RowContext';

export type TableDimensions = {
  numberOfColumns: number;
  numberOfRows: number;
};

export function useCurrentRowEntityId() {
  const currentRowEntityIdScoped = useRecoilScopedValue(
    currentRowEntityIdScopedState,
    RowContext,
  );

  return currentRowEntityIdScoped;
}
