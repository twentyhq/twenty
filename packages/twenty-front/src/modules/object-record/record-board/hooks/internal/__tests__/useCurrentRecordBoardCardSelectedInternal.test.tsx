import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { BoardCardIdContext } from '@/object-record/record-board/contexts/BoardCardIdContext';
import { useCurrentRecordBoardCardSelectedInternal } from '@/object-record/record-board/hooks/internal/useCurrentRecordBoardCardSelectedInternal';
import { useRecordBoardScopedStates } from '@/object-record/record-board/hooks/internal/useRecordBoardScopedStates';
import { RecordBoardScope } from '@/object-record/record-board/scopes/RecordBoardScope';
import { actionBarOpenState } from '@/ui/navigation/action-bar/states/actionBarIsOpenState';

const scopeId = 'scopeId';
const boardCardId = 'boardCardId';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecordBoardScope recordBoardScopeId={scopeId}>
    <BoardCardIdContext.Provider value={boardCardId}>
      <RecoilRoot>{children}</RecoilRoot>
    </BoardCardIdContext.Provider>
  </RecordBoardScope>
);

describe('useCurrentRecordBoardCardSelectedInternal', () => {
  it('should update the data when selecting and deselecting the cardId', () => {
    const { result } = renderHook(
      () => ({
        currentCardSelect: useCurrentRecordBoardCardSelectedInternal(),
        activeCardIdsState: useRecoilValue(
          useRecordBoardScopedStates().activeCardIdsState,
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
