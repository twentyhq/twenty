import { useRecoilCallback } from 'recoil';

import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
import { RecordBoardDeprecatedScopeInternalContext } from '@/object-record/record-board-deprecated/scopes/scope-internal-context/RecordBoardDeprecatedScopeInternalContext';
import { actionBarOpenState } from '@/ui/navigation/action-bar/states/actionBarIsOpenState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { isRecordBoardDeprecatedCardSelectedFamilyState } from '../../states/isRecordBoardDeprecatedCardSelectedFamilyState';

export const useSetRecordBoardDeprecatedCardSelectedInternal = (props: any) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordBoardDeprecatedScopeInternalContext,
    props?.recordBoardScopeId,
  );
  const { activeCardIdsState } = useRecordBoardDeprecatedScopedStates({
    recordBoardScopeId: scopeId,
  });

  const setCardSelected = useRecoilCallback(
    ({ set, snapshot }) =>
      (cardId: string, selected: boolean) => {
        const activeCardIds = snapshot.getLoadable(activeCardIdsState).contents;

        set(isRecordBoardDeprecatedCardSelectedFamilyState(cardId), selected);
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
          set(isRecordBoardDeprecatedCardSelectedFamilyState(cardId), false);
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
