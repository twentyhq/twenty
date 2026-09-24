import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RecordShowPageResourceEffect } from '@/object-record/record-show/components/RecordShowPageResourceEffect';
import { useRecordShowPageResource } from '@/object-record/record-show/hooks/useRecordShowPageResource';
import { render, renderHook } from '@testing-library/react';
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
  it('loads the canonical show-page fields', () => {
    const store = createStore();
    const record = { __typename: 'Person', id: 'record-1', name: 'Ada' };
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
  });

  it('synchronizes and clears the record store through its effect', () => {
    const store = createStore();
    const record = { __typename: 'Person', id: 'record-1', name: 'Ada' };
    const { rerender } = render(
      <Provider store={store}>
        <RecordShowPageResourceEffect
          loading={false}
          record={record}
          recordId="record-1"
        />
      </Provider>,
    );

    expect(store.get(recordStoreFamilyState.atomFamily('record-1'))).toEqual(
      record,
    );

    rerender(
      <Provider store={store}>
        <RecordShowPageResourceEffect
          loading={false}
          record={undefined}
          recordId="record-1"
        />
      </Provider>,
    );

    expect(store.get(recordStoreFamilyState.atomFamily('record-1'))).toBeNull();
  });
});
