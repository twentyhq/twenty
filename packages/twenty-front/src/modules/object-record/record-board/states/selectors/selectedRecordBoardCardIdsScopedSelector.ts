import { createSelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorScopeMap';

import { isRecordBoardCardSelectedFamilyState } from '../isRecordBoardCardSelectedFamilyState';
import { recordBoardCardIdsByColumnIdFamilyState } from '../recordBoardCardIdsByColumnIdFamilyState';
import { recordBoardColumnsScopedState } from '../recordBoardColumnsScopedState';

export const selectedRecordBoardCardIdsScopedSelector = createSelectorScopeMap<
  string[]
>({
  key: 'selectedRecordBoardCardIdsScopedSelector',
  get:
    ({ scopeId }) =>
    ({ get }) => {
      const boardColumns = get(recordBoardColumnsScopedState({ scopeId }));

      const cardIds = boardColumns.flatMap((boardColumn) =>
        get(recordBoardCardIdsByColumnIdFamilyState(boardColumn.id)),
      );

      const selectedCardIds = cardIds.filter(
        (cardId) => get(isRecordBoardCardSelectedFamilyState(cardId)) === true,
      );

      return selectedCardIds;
    },
});
