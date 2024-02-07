import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

import { isRecordBoardDeprecatedCardSelectedFamilyState } from '../isRecordBoardDeprecatedCardSelectedFamilyState';
import { recordBoardCardIdsByColumnIdFamilyState } from '../recordBoardCardIdsByColumnIdFamilyState';
import { recordBoardColumnsScopedState } from '../recordBoardColumnsScopedState';

export const selectedRecordBoardDeprecatedCardIdsScopedSelector =
  createSelectorReadOnlyScopeMap<string[]>({
    key: 'selectedRecordBoardDeprecatedCardIdsScopedSelector',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const boardColumns = get(recordBoardColumnsScopedState({ scopeId }));

        const cardIds = boardColumns.flatMap((boardColumn) =>
          get(recordBoardCardIdsByColumnIdFamilyState(boardColumn.id)),
        );

        const selectedCardIds = cardIds.filter(
          (cardId) =>
            get(isRecordBoardDeprecatedCardSelectedFamilyState(cardId)) ===
            true,
        );

        return selectedCardIds;
      },
  });
