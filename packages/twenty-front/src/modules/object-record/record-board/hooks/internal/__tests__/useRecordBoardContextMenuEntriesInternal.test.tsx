import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useDeleteSelectedRecordBoardCardsInternal } from '@/object-record/record-board/hooks/internal/useDeleteSelectedRecordBoardCardsInternal';
import { useRecordBoardContextMenuEntriesInternal } from '@/object-record/record-board/hooks/internal/useRecordBoardContextMenuEntriesInternal';
import { RecordBoardScope } from '@/object-record/record-board/scopes/RecordBoardScope';
import { IconTrash } from '@/ui/display/icon';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';

const scopeId = 'scopeId';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider>
    <RecordBoardScope recordBoardScopeId={scopeId}>
      <RecoilRoot>{children}</RecoilRoot>
    </RecordBoardScope>
  </MockedProvider>
);

describe('useRecordBoardContextMenuEntriesInternal', () => {
  it('should update contextEntries', async () => {
    const { result } = renderHook(
      () => {
        const deleteSelectedBoardCards =
          useDeleteSelectedRecordBoardCardsInternal();
        const newContextEntry = {
          label: 'Delete',
          Icon: IconTrash,
          accent: 'danger',
          onClick: deleteSelectedBoardCards,
        };
        return {
          setContextEntries: useRecordBoardContextMenuEntriesInternal(),
          contextEntries: useRecoilValue(contextMenuEntriesState),
          newContextEntry,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.contextEntries).toStrictEqual([]);

    act(() => {
      result.current.setContextEntries.setContextMenuEntries();
    });

    await waitFor(() => {
      expect(JSON.stringify(result.current.contextEntries)).toBe(
        JSON.stringify([result.current.newContextEntry]),
      );
    });
  });
});
