import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndContextStoreWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getPeopleMock } from '~/testing/mock-data/people';
import { useDeleteMultipleRecordsAction } from '../useDeleteMultipleRecordsAction';

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const peopleMock = getPeopleMock();

const deleteManyRecordsMock = jest.fn();
const resetTableRowSelectionMock = jest.fn();

jest.mock('@/object-record/hooks/useDeleteManyRecords', () => ({
  useDeleteManyRecords: () => ({
    deleteManyRecords: deleteManyRecordsMock,
  }),
}));

jest.mock('@/object-record/hooks/useLazyFetchAllRecords', () => ({
  useLazyFetchAllRecords: () => {
    return {
      fetchAllRecords: () => [peopleMock[0], peopleMock[1]],
    };
  },
}));

jest.mock('@/object-record/record-table/hooks/useRecordTable', () => ({
  useRecordTable: () => ({
    resetTableRowSelection: resetTableRowSelectionMock,
  }),
}));

const wrapper = getJestMetadataAndApolloMocksAndActionMenuWrapper({
  apolloMocks: [],
  componentInstanceId: '1',
  contextStoreCurrentObjectMetadataNameSingular:
    personMockObjectMetadataItem.nameSingular,
  contextStoreTargetedRecordsRule: {
    mode: 'selection',
    selectedRecordIds: [peopleMock[0].id, peopleMock[1].id],
  },
  contextStoreNumberOfSelectedRecords: 2,
  onInitializeRecoilSnapshot: (snapshot) => {
    snapshot.set(recordStoreFamilyState(peopleMock[0].id), peopleMock[0]);
    snapshot.set(recordStoreFamilyState(peopleMock[1].id), peopleMock[1]);
  },
});

describe('useDeleteMultipleRecordsAction', () => {
  it('should call deleteManyRecords on click', async () => {
    const { result } = renderHook(
      () =>
        useDeleteMultipleRecordsAction({
          objectMetadataItem: personMockObjectMetadataItem,
        }),
      {
        wrapper,
      },
    );

    expect(result.current.ConfirmationModal?.props?.isOpen).toBe(false);

    act(() => {
      result.current.onClick();
    });

    expect(result.current.ConfirmationModal?.props?.isOpen).toBe(true);

    act(() => {
      result.current.ConfirmationModal?.props?.onConfirmClick();
    });

    await waitFor(() => {
      expect(resetTableRowSelectionMock).toHaveBeenCalled();

      expect(deleteManyRecordsMock).toHaveBeenCalledWith([
        peopleMock[0].id,
        peopleMock[1].id,
      ]);
    });
  });
});
