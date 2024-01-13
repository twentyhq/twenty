import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useDeleteSelectedRecordBoardCardsInternal } from '@/object-record/record-board/hooks/internal/useDeleteSelectedRecordBoardCardsInternal';
import { useRecordBoardActionBarEntriesInternal } from '@/object-record/record-board/hooks/internal/useRecordBoardActionBarEntriesInternal';
import { RecordBoardScope } from '@/object-record/record-board/scopes/RecordBoardScope';
import { IconTrash } from '@/ui/display/icon';
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';

const scopeId = 'scopeId';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider>
    <RecordBoardScope recordBoardScopeId={scopeId}>
      <RecoilRoot>{children}</RecoilRoot>
    </RecordBoardScope>
  </MockedProvider>
);

const renderHookConfig = {
  wrapper: Wrapper,
};

describe('useRecordBoardActionBarEntriesInternal', () => {
  it('should update actionBarEntries', async () => {
    const { result } = renderHook(() => {
      const deleteSelectedBoardCards =
        useDeleteSelectedRecordBoardCardsInternal();
      const newActionBarEntry = {
        label: 'Delete',
        Icon: IconTrash,
        accent: 'danger',
        onClick: deleteSelectedBoardCards,
      };
      return {
        setActionBarEntries: useRecordBoardActionBarEntriesInternal(),
        actionBarEntries: useRecoilValue(actionBarEntriesState),
        newActionBarEntry,
      };
    }, renderHookConfig);

    expect(result.current.actionBarEntries).toStrictEqual([]);

    act(() => {
      result.current.setActionBarEntries.setActionBarEntries();
    });

    await waitFor(() => {
      expect(JSON.stringify(result.current.actionBarEntries)).toBe(
        JSON.stringify([result.current.newActionBarEntry]),
      );
    });
  });
});
