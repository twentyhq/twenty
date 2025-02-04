import { DestroyManyRecordsProps } from '@/object-record/hooks/useDestroyManyRecords';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { expect } from '@storybook/test';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndContextStoreWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getPeopleMock } from '~/testing/mock-data/people';
import { useDestroyMultipleRecordsAction } from '../useDestroyMultipleRecordsAction';

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const [firstPeopleMock, secondPeopleMock, _rest] = getPeopleMock().map(
  (record) => ({
    ...record,
    deletedAt: new Date().toISOString(),
  }),
);

const destroyManyRecordsMock = jest.fn();
const resetTableRowSelectionMock = jest.fn();

// TODO discuss that should mock prototype to avoid duplicated import ? Also no typed
jest.mock('@/object-record/hooks/useDestroyManyRecords', () => ({
  useDestroyManyRecords: () => ({
    destroyManyRecords: destroyManyRecordsMock,
  }),
}));

jest.mock('@/object-record/hooks/useLazyFetchAllRecords', () => ({
  useLazyFetchAllRecords: () => {
    return {
      fetchAllRecords: () => [firstPeopleMock, secondPeopleMock],
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
    selectedRecordIds: [firstPeopleMock.id, secondPeopleMock.id],
  },
  contextStoreNumberOfSelectedRecords: 2,
  onInitializeRecoilSnapshot: (snapshot) => {
    snapshot.set(recordStoreFamilyState(firstPeopleMock.id), firstPeopleMock);
    snapshot.set(recordStoreFamilyState(secondPeopleMock.id), secondPeopleMock);
  },
});

describe('useDestroyMultipleRecordsAction', () => {
  // TODO modify jest wrapper to allow injecting custom filters in contextStoreFiltersComponentState
  it.skip('should call destroyManyRecords on click if records are filtered by deletedAt', async () => {
    const { result } = renderHook(
      () =>
        useDestroyMultipleRecordsAction({
          objectMetadataItem: personMockObjectMetadataItem,
        }),
      {
        wrapper,
      },
    );

    expect(result.current.ConfirmationModal?.props?.isOpen).toBeFalsy();

    act(() => {
      result.current.onClick();
    });

    expect(result.current.ConfirmationModal?.props?.isOpen).toBeTruthy();

    act(() => {
      result.current.ConfirmationModal?.props?.onConfirmClick();
    });

    const expectedParams: DestroyManyRecordsProps = {
      recordIdsToDestroy: [firstPeopleMock.id, secondPeopleMock.id],
    };
    await waitFor(() => {
      expect(resetTableRowSelectionMock).toHaveBeenCalled();
      expect(destroyManyRecordsMock).toHaveBeenCalledWith(expectedParams);
    });
  });

  it('should not call destroyManyRecords on click if records are not filtered by deletedAt', async () => {
    const { result } = renderHook(
      () =>
        useDestroyMultipleRecordsAction({
          objectMetadataItem: personMockObjectMetadataItem,
        }),
      {
        wrapper,
      },
    );

    expect(result.current.ConfirmationModal?.props?.isOpen).toBeFalsy();

    act(() => {
      result.current.onClick();
    });

    expect(result.current.ConfirmationModal?.props?.isOpen).toBeFalsy();
  });
});
