import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';

import { boardCardIdsByColumnIdFamilyState } from '../boardCardIdsByColumnIdFamilyState';
import { boardColumnsScopedState } from '../boardColumnsScopedState';
import { isCardSelectedFamilyState } from '../isCardSelectedFamilyState';

export const selectedCardIdsScopedSelector = createScopedSelector<string[]>({
  key: 'selectedCardIdsSelector',
  get:
    ({ scopeId }) =>
    ({ get }) => {
      const boardColumns = get(boardColumnsScopedState({ scopeId }));

      const cardIds = boardColumns.flatMap((boardColumn) =>
        get(boardCardIdsByColumnIdFamilyState(boardColumn.id)),
      );

      const selectedCardIds = cardIds.filter(
        (cardId) => get(isCardSelectedFamilyState(cardId)) === true,
      );

      return selectedCardIds;
    },
});
