import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useSetRecordBoardDeprecatedCardSelectedInternal } from '@/object-record/record-board-deprecated/hooks/internal/useSetRecordBoardDeprecatedCardSelectedInternal';
import { RecordBoardDeprecatedScope } from '@/object-record/record-board-deprecated/scopes/RecordBoardDeprecatedScope';
import { isRecordBoardDeprecatedCardSelectedFamilyState } from '@/object-record/record-board-deprecated/states/isRecordBoardDeprecatedCardSelectedFamilyState';

const scopeId = 'scopeId';
const boardCardId = 'boardCardId';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecordBoardDeprecatedScope recordBoardScopeId={scopeId}>
    <RecoilRoot>{children}</RecoilRoot>
  </RecordBoardDeprecatedScope>
);

const recordBoardScopeId = 'recordBoardScopeId';

describe('useSetRecordBoardDeprecatedCardSelectedInternal', () => {
  it('should update the data when selecting and deselecting the cardId', async () => {
    const { result } = renderHook(
      () => {
        return {
          cardSelect: useSetRecordBoardDeprecatedCardSelectedInternal({
            recordBoardScopeId,
          }),
          isSelected: useRecoilValue(
            isRecordBoardDeprecatedCardSelectedFamilyState(boardCardId),
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
