import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { BoardCardIdContext } from '@/object-record/record-board-deprecated/contexts/BoardCardIdContext';
import { useCurrentRecordBoardDeprecatedCardSelectedInternal } from '@/object-record/record-board-deprecated/hooks/internal/useCurrentRecordBoardDeprecatedCardSelectedInternal';
import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
import { RecordBoardDeprecatedScope } from '@/object-record/record-board-deprecated/scopes/RecordBoardDeprecatedScope';
import { actionBarOpenState } from '@/ui/navigation/action-bar/states/actionBarIsOpenState';

const scopeId = 'scopeId';
const boardCardId = 'boardCardId';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecordBoardDeprecatedScope recordBoardScopeId={scopeId}>
    <BoardCardIdContext.Provider value={boardCardId}>
      <RecoilRoot>{children}</RecoilRoot>
    </BoardCardIdContext.Provider>
  </RecordBoardDeprecatedScope>
);

describe('useCurrentRecordBoardDeprecatedCardSelectedInternal', () => {
  it('should update the data when selecting and deselecting the cardId', () => {
    const { result } = renderHook(
      () => ({
        currentCardSelect:
          useCurrentRecordBoardDeprecatedCardSelectedInternal(),
        activeCardIdsState: useRecoilValue(
          useRecordBoardDeprecatedScopedStates().activeCardIdsState,
        ),
        actionBarOpenState: useRecoilValue(actionBarOpenState),
      }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.activeCardIdsState).toStrictEqual([]);
    expect(result.current.actionBarOpenState).toBe(false);
    expect(result.current.currentCardSelect.isCurrentCardSelected).toBe(false);

    act(() => {
      result.current.currentCardSelect.setCurrentCardSelected(true);
    });

    expect(result.current.activeCardIdsState).toStrictEqual([boardCardId]);
    expect(result.current.actionBarOpenState).toBe(true);
    expect(result.current.currentCardSelect.isCurrentCardSelected).toBe(true);

    act(() => {
      result.current.currentCardSelect.setCurrentCardSelected(false);
    });

    expect(result.current.activeCardIdsState).toStrictEqual([]);
    expect(result.current.actionBarOpenState).toBe(false);
    expect(result.current.currentCardSelect.isCurrentCardSelected).toBe(false);
  });
});
