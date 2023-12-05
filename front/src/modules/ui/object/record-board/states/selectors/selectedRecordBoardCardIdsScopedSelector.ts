import { createScopedSelector } from '@/ui/utilities/recoil-scope/utils/createScopedSelector';

import { isRecordBoardCardSelectedFamilyState } from '../isRecordBoardCardSelectedFamilyState';
import { recordBoardCardIdsByColumnIdFamilyState } from '../recordBoardCardIdsByColumnIdFamilyState';
import { recordBoardColumnsScopedState } from '../recordBoardColumnsScopedState';

export const selectedRecordBoardCardIdsScopedSelector = createScopedSelector<
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
