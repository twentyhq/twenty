import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useSetRecordBoardCardSelectedInternal } from '@/object-record/record-board/hooks/internal/useSetRecordBoardCardSelectedInternal';
import { RecordBoardScope } from '@/object-record/record-board/scopes/RecordBoardScope';
import { isRecordBoardCardSelectedFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedFamilyState';

const scopeId = 'scopeId';
const boardCardId = 'boardCardId';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecordBoardScope recordBoardScopeId={scopeId}>
    <RecoilRoot>{children}</RecoilRoot>
  </RecordBoardScope>
);

const recordBoardScopeId = 'recordBoardScopeId';

describe('useSetRecordBoardCardSelectedInternal', () => {
  it('should update the data when selecting and deselecting the cardId', async () => {
    const { result } = renderHook(
      () => {
        return {
          cardSelect: useSetRecordBoardCardSelectedInternal({
            recordBoardScopeId,
          }),
          isSelected: useRecoilValue(
            isRecordBoardCardSelectedFamilyState(boardCardId),
          ),
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isSelected).toBe(false);

    act(() => {
      result.current.cardSelect.setCardSelected(boardCardId, true);
    });

    expect(result.current.isSelected).toBe(true);

    act(() => {
      result.current.cardSelect.setCardSelected(boardCardId, false);
    });

    expect(result.current.isSelected).toBe(false);

    act(() => {
      result.current.cardSelect.setCardSelected(boardCardId, true);
      result.current.cardSelect.unselectAllActiveCards();
    });

    expect(result.current.isSelected).toBe(false);
  });
});
