import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordShowPageResource } from '@/object-record/record-show/hooks/useRecordShowPageResource';
import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

const mockUseFindOneRecord = jest.fn();

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: { id: 'person-object' },
  }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: (...args: unknown[]) => mockUseFindOneRecord(...args),
}));

jest.mock(
  '@/object-record/record-show/graphql/operations/factories/findOneRecordForShowPageOperationSignatureFactory',
  () => ({
    buildFindOneRecordForShowPageOperationSignature: () => ({
      fields: { id: true, name: true },
    }),
  }),
);

describe('useRecordShowPageResource', () => {
  it('loads the canonical show-page fields and synchronizes the record store', () => {
    const store = createStore();
    const record = { id: 'record-1', name: 'Ada' };
    mockUseFindOneRecord.mockReturnValue({
      record,
      loading: false,
      error: undefined,
    });

    const { result } = renderHook(
      () =>
        useRecordShowPageResource({
          objectNameSingular: 'person',
          recordId: 'record-1',
        }),
      {
        wrapper: ({ children }) => (
          <Provider store={store}>{children}</Provider>
        ),
      },
    );

    expect(mockUseFindOneRecord).toHaveBeenCalledWith({
      objectRecordId: 'record-1',
      objectNameSingular: 'person',
      recordGqlFields: { id: true, name: true },
      withSoftDeleted: true,
    });
    expect(result.current.record).toEqual(record);
    expect(store.get(recordStoreFamilyState.atomFamily('record-1'))).toEqual(
      record,
    );
  });
});
