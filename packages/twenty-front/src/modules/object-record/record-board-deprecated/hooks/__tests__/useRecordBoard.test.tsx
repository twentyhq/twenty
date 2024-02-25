import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
import { useRecordBoardDeprecated } from '@/object-record/record-board-deprecated/hooks/useRecordBoardDeprecated';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider>
    <RecoilRoot>{children}</RecoilRoot>
  </MockedProvider>
);

const recordBoardScopeId = 'recordBoardScopeId';

const renderHookConfig = {
  wrapper: Wrapper,
};

const useRecordBoardDeprecatedHook = () => {
  const recordBoard = useRecordBoardDeprecated({ recordBoardScopeId });
  const { isBoardLoadedState, boardColumnsState, onFieldsChangeState } =
    useRecordBoardDeprecatedScopedStates({
      recordBoardScopeId: recordBoardScopeId,
    });
  const isBoardLoaded = useRecoilValue(isBoardLoadedState);
  const boardColumns = useRecoilValue(boardColumnsState);
  const onFieldsChange = useRecoilValue(onFieldsChangeState);

  return {
    recordBoard,
    isBoardLoaded,
    boardColumns,
    onFieldsChange,
  };
};

describe('useRecordBoardDeprecated', () => {
  it('should set isBoardLoadedState', async () => {
    const { result } = renderHook(
      () => useRecordBoardDeprecatedHook(),
      renderHookConfig,
    );

    act(() => {
      result.current.recordBoard.setIsBoardLoaded(true);
    });

    await waitFor(() => {
      expect(result.current.isBoardLoaded).toBe(true);
    });
  });

  it('should set boardColumnsState', async () => {
    const columns = [
      {
        id: '1',
        title: '1',
        position: 1,
      },
      {
        id: '1',
        title: '1',
        position: 1,
      },
    ];
    const { result } = renderHook(
      () => useRecordBoardDeprecatedHook(),
      renderHookConfig,
    );

    act(() => {
      result.current.recordBoard.setBoardColumns(columns);
    });

    await waitFor(() => {
      expect(result.current.boardColumns).toEqual(columns);
    });
  });

  it('should set setOnFieldsChange', async () => {
    const onFieldsChangeFunction = () => {};
    const onFieldsChange = jest.fn(() => onFieldsChangeFunction);
    const { result } = renderHook(
      () => useRecordBoardDeprecatedHook(),
      renderHookConfig,
    );

    act(() => {
      result.current.recordBoard.setOnFieldsChange(onFieldsChange);
    });

    await waitFor(() => {
      expect(result.current.onFieldsChange).toEqual(onFieldsChangeFunction);
    });
  });
});
