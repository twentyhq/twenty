import { useRecoilCallback } from 'recoil';

import { actionBarOpenState } from '@/ui/navigation/action-bar/states/actionBarIsOpenState';
import { useRecordBoardScopedStates } from '@/ui/object/record-board/hooks/internal/useRecordBoardScopedStates';
import { RecordBoardScopeInternalContext } from '@/ui/object/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { isCardSelectedFamilyState } from '../../states/isCardSelectedFamilyState';

export const useSetRecordBoardCardSelectedInternal = (props: any) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordBoardScopeInternalContext,
    props?.recordBoardScopeId,
  );
  const { activeCardIdsState } = useRecordBoardScopedStates({
    recordBoardScopeId: scopeId,
  });

  const setCardSelected = useRecoilCallback(
    ({ set, snapshot }) =>
      (cardId: string, selected: boolean) => {
        const activeCardIds = snapshot.getLoadable(activeCardIdsState).contents;

        set(isCardSelectedFamilyState(cardId), selected);
        set(actionBarOpenState, selected || activeCardIds.length > 0);

        if (selected) {
          set(activeCardIdsState, [...activeCardIds, cardId]);
        } else {
          set(
            activeCardIdsState,
            activeCardIds.filter((id: string) => id !== cardId),
          );
        }
      },
    [activeCardIdsState],
  );

  const unselectAllActiveCards = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const activeCardIds = snapshot.getLoadable(activeCardIdsState).contents;

        activeCardIds.forEach((cardId: string) => {
          set(isCardSelectedFamilyState(cardId), false);
        });

        set(activeCardIdsState, []);
        set(actionBarOpenState, false);
      },
    [activeCardIdsState],
  );

  return {
    setCardSelected,
    unselectAllActiveCards,
  };
};
