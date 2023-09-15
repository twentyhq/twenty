import { useRecoilCallback } from 'recoil';

import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';

import { numberOfTableRowsState } from '../states/numberOfTableRowsState';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { numberOfTableColumnsScopedSelector } from '../states/selectors/numberOfTableColumnsScopedSelector';
import { softFocusPositionState } from '../states/softFocusPositionState';

import { useSetSoftFocusPosition } from './useSetSoftFocusPosition';

// TODO: stories
export function useMoveSoftFocus() {
  const tableScopeId = useRecoilScopeId(TableRecoilScopeContext);
  const setSoftFocusPosition = useSetSoftFocusPosition();

  const moveUp = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = snapshot
          .getLoadable(softFocusPositionState)
          .valueOrThrow();

        let newRowNumber = softFocusPosition.row - 1;

        if (newRowNumber < 0) {
          newRowNumber = 0;
        }

        setSoftFocusPosition({
          ...softFocusPosition,
          row: newRowNumber,
        });
      },
    [setSoftFocusPosition],
  );

  const moveDown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = snapshot
          .getLoadable(softFocusPositionState)
          .valueOrThrow();

        const numberOfTableRows = snapshot
          .getLoadable(numberOfTableRowsState)
          .valueOrThrow();

        let newRowNumber = softFocusPosition.row + 1;

        if (newRowNumber >= numberOfTableRows) {
          newRowNumber = numberOfTableRows - 1;
        }

        setSoftFocusPosition({
          ...softFocusPosition,
          row: newRowNumber,
        });
      },
    [setSoftFocusPosition],
  );

  const moveRight = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = snapshot
          .getLoadable(softFocusPositionState)
          .valueOrThrow();

        const numberOfTableColumns = snapshot
          .getLoadable(numberOfTableColumnsScopedSelector(tableScopeId))
          .valueOrThrow();

        const numberOfTableRows = snapshot
          .getLoadable(numberOfTableRowsState)
          .valueOrThrow();

        const currentColumnNumber = softFocusPosition.column;
        const currentRowNumber = softFocusPosition.row;

        const isLastRowAndLastColumn =
          currentColumnNumber === numberOfTableColumns - 1 &&
          currentRowNumber === numberOfTableRows - 1;

        const isLastColumnButNotLastRow =
          currentColumnNumber === numberOfTableColumns - 1 &&
          currentRowNumber !== numberOfTableRows - 1;

        const isNotLastColumn =
          currentColumnNumber !== numberOfTableColumns - 1;

        if (isLastRowAndLastColumn) {
          return;
        }

        if (isNotLastColumn) {
          setSoftFocusPosition({
            row: currentRowNumber,
            column: currentColumnNumber + 1,
          });
        } else if (isLastColumnButNotLastRow) {
          setSoftFocusPosition({
            row: currentRowNumber + 1,
            column: 0,
          });
        }
      },
    [setSoftFocusPosition, tableScopeId],
  );

  const moveLeft = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = snapshot
          .getLoadable(softFocusPositionState)
          .valueOrThrow();

        const numberOfTableColumns = snapshot
          .getLoadable(numberOfTableColumnsScopedSelector(tableScopeId))
          .valueOrThrow();

        const currentColumnNumber = softFocusPosition.column;
        const currentRowNumber = softFocusPosition.row;

        const isFirstRowAndFirstColumn =
          currentColumnNumber === 0 && currentRowNumber === 0;

        const isFirstColumnButNotFirstRow =
          currentColumnNumber === 0 && currentRowNumber > 0;

        const isNotFirstColumn = currentColumnNumber > 0;

        if (isFirstRowAndFirstColumn) {
          return;
        }

        if (isNotFirstColumn) {
          setSoftFocusPosition({
            row: currentRowNumber,
            column: currentColumnNumber - 1,
          });
        } else if (isFirstColumnButNotFirstRow) {
          setSoftFocusPosition({
            row: currentRowNumber - 1,
            column: numberOfTableColumns - 1,
          });
        }
      },
    [setSoftFocusPosition, tableScopeId],
  );

  return {
    moveDown,
    moveLeft,
    moveRight,
    moveUp,
  };
}
