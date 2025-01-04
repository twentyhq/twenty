import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndContextStoreWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getPeopleMock } from '~/testing/mock-data/people';
import { useExportMultipleRecordsAction } from '../useExportMultipleRecordsAction';

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const peopleMock = getPeopleMock();

const downloadMock = jest.fn();

jest.mock('@/object-record/record-index/export/hooks/useExportRecords', () => ({
  useExportRecords: () => ({
    download: downloadMock,
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

describe('useExportMultipleRecordsAction', () => {
  it('should call exportManyRecords on click', async () => {
    const { result } = renderHook(
      () =>
        useExportMultipleRecordsAction({
          objectMetadataItem: personMockObjectMetadataItem,
        }),
      {
        wrapper,
      },
    );

    act(() => {
      result.current.onClick();
    });

    await waitFor(() => {
      expect(downloadMock).toHaveBeenCalled();
    });
  });
});
