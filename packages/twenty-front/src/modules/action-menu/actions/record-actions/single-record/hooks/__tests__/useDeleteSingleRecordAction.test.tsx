import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndContextStoreWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { getPeopleMock } from '~/testing/mock-data/people';
import { useDeleteSingleRecordAction } from '../useDeleteSingleRecordAction';

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const peopleMock = getPeopleMock();

const deleteOneRecordMock = jest.fn();

jest.mock('@/object-record/hooks/useDeleteOneRecord', () => ({
  useDeleteOneRecord: () => ({
    deleteOneRecord: deleteOneRecordMock,
  }),
}));

const wrapper = getJestMetadataAndApolloMocksAndActionMenuWrapper({
  apolloMocks: [],
  componentInstanceId: '1',
  contextStoreCurrentObjectMetadataNameSingular:
    personMockObjectMetadataItem.nameSingular,
  contextStoreTargetedRecordsRule: {
    mode: 'selection',
    selectedRecordIds: [peopleMock[0].id],
  },
  onInitializeRecoilSnapshot: (snapshot) => {
    snapshot.set(recordStoreFamilyState(peopleMock[0].id), peopleMock[0]);
  },
});

describe('useDeleteSingleRecordAction', () => {
  it('should call deleteOneRecord on click', () => {
    const { result } = renderHook(
      () =>
        useDeleteSingleRecordAction({
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

    expect(deleteOneRecordMock).toHaveBeenCalledWith(peopleMock[0].id);
  });
});
