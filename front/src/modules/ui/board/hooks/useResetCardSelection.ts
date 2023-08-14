import { useRecoilCallback } from 'recoil';

import { boardCardIdsByColumnIdFamilyState } from '../states/boardCardIdsByColumnIdFamilyState';
import { boardColumnsState } from '../states/boardColumnsState';
import { isCardSelectedFamilyState } from '../states/isCardSelectedFamilyState';

export function useResetCardSelection() {
  return useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const boardColumns = snapshot
          .getLoadable(boardColumnsState)
          .valueOrThrow();

        const cardIds = boardColumns.flatMap((boardColumn) =>
          snapshot
            .getLoadable(boardCardIdsByColumnIdFamilyState(boardColumn.id))
            .valueOrThrow(),
        );

        for (const cardId of cardIds) {
          set(isCardSelectedFamilyState(cardId), false);
        }
      },
    [],
  );
}
