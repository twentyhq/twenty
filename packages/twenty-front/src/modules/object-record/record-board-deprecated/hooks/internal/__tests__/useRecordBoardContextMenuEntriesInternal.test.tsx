import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useDeleteSelectedRecordBoardDeprecatedCardsInternal } from '@/object-record/record-board-deprecated/hooks/internal/useDeleteSelectedRecordBoardDeprecatedCardsInternal';
import { useRecordBoardDeprecatedContextMenuEntriesInternal } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedContextMenuEntriesInternal';
import { RecordBoardDeprecatedScope } from '@/object-record/record-board-deprecated/scopes/RecordBoardDeprecatedScope';
import { IconTrash } from '@/ui/display/icon';
import { contextMenuEntriesState } from '@/ui/navigation/context-menu/states/contextMenuEntriesState';

const scopeId = 'scopeId';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider>
    <RecordBoardDeprecatedScope recordBoardScopeId={scopeId}>
      <RecoilRoot>{children}</RecoilRoot>
    </RecordBoardDeprecatedScope>
  </MockedProvider>
);

describe('useRecordBoardDeprecatedContextMenuEntriesInternal', () => {
  it('should update contextEntries', async () => {
    const { result } = renderHook(
      () => {
        const deleteSelectedBoardCards =
          useDeleteSelectedRecordBoardDeprecatedCardsInternal();
        const newContextEntry = {
          label: 'Delete',
          Icon: IconTrash,
          accent: 'danger',
          onClick: deleteSelectedBoardCards,
        };
        return {
          setContextEntries:
            useRecordBoardDeprecatedContextMenuEntriesInternal(),
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
