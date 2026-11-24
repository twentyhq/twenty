import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { type ReactNode } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerIsLoadingComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerIsLoadingComponentState';

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: jest.fn(),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({
    objectPermissionsByObjectMetadataId: {
      'company-metadata-id': {
        canReadAllRecords: true,
        canReadSomeRecords: true,
      },
    },
  }),
}));

jest.mock(
  '@/object-record/multiple-objects/hooks/usePerformCombinedFindManyRecords',
  () => ({
    usePerformCombinedFindManyRecords: () => ({
      performCombinedFindManyRecords: jest.fn(),
    }),
  }),
);

const INSTANCE_ID = 'record-picker-instance';

const companyObjectMetadataItem = {
  id: 'company-metadata-id',
  nameSingular: 'company',
} as EnrichedObjectMetadataItem;

describe('useMultipleRecordPickerPerformSearch', () => {
  it('clears the loading state when the search query fails', async () => {
    (useApolloCoreClient as jest.Mock).mockReturnValue({
      query: jest.fn().mockRejectedValue(new Error('Network error')),
    });

    const store = createStore();
    const isLoadingAtom =
      multipleRecordPickerIsLoadingComponentState.atomFamily({
        instanceId: INSTANCE_ID,
      });

    const { result } = renderHook(
      () => useMultipleRecordPickerPerformSearch(),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <JotaiProvider store={store}>{children}</JotaiProvider>
        ),
      },
    );

    await expect(
      result.current.performSearch({
        multipleRecordPickerInstanceId: INSTANCE_ID,
        forceSearchableObjectMetadataItems: [companyObjectMetadataItem],
      }),
    ).rejects.toThrow('Network error');

    expect(store.get(isLoadingAtom)).toBe(false);
  });
});
