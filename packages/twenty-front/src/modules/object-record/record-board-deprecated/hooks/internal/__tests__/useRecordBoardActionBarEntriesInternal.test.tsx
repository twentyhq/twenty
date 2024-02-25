import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useDeleteSelectedRecordBoardDeprecatedCardsInternal } from '@/object-record/record-board-deprecated/hooks/internal/useDeleteSelectedRecordBoardDeprecatedCardsInternal';
import { useRecordBoardDeprecatedActionBarEntriesInternal } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedActionBarEntriesInternal';
import { RecordBoardDeprecatedScope } from '@/object-record/record-board-deprecated/scopes/RecordBoardDeprecatedScope';
import { IconTrash } from '@/ui/display/icon';
import { actionBarEntriesState } from '@/ui/navigation/action-bar/states/actionBarEntriesState';

const scopeId = 'scopeId';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider>
    <RecordBoardDeprecatedScope recordBoardScopeId={scopeId}>
      <RecoilRoot>{children}</RecoilRoot>
    </RecordBoardDeprecatedScope>
  </MockedProvider>
);

const renderHookConfig = {
  wrapper: Wrapper,
};

describe('useRecordBoardDeprecatedActionBarEntriesInternal', () => {
  it('should update actionBarEntries', async () => {
    const { result } = renderHook(() => {
      const deleteSelectedBoardCards =
        useDeleteSelectedRecordBoardDeprecatedCardsInternal();
      const newActionBarEntry = {
        label: 'Delete',
        Icon: IconTrash,
        accent: 'danger',
        onClick: deleteSelectedBoardCards,
      };
      return {
        setActionBarEntries: useRecordBoardDeprecatedActionBarEntriesInternal(),
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
