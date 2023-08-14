import { selector } from 'recoil';

import { boardCardIdsByColumnIdFamilyState } from './boardCardIdsByColumnIdFamilyState';
import { boardColumnsState } from './boardColumnsState';
import { isCardSelectedFamilyState } from './isCardSelectedFamilyState';

export const selectedCardIdsSelector = selector<string[]>({
  key: 'selectedCardIdsSelector',
  get: ({ get }) => {
    const boardColumns = get(boardColumnsState);

    const cardIds = boardColumns.flatMap((boardColumn) =>
      get(boardCardIdsByColumnIdFamilyState(boardColumn.id)),
    );

    const selectedCardIds = cardIds.filter(
      (cardId) => get(isCardSelectedFamilyState(cardId)) === true,
    );

    return selectedCardIds;
  },
});
