import { InMemoryCache } from '@apollo/client';
import { render } from '@testing-library/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordTableContextProvider } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableVirtualizedEvictRecordsCacheOnUnmountEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedEvictRecordsCacheOnUnmountEffect';

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: jest.fn(),
}));

const renderEffect = (cache: InMemoryCache) =>
  render(
    <RecordTableContextProvider
      value={
        {
          objectMetadataItem: {
            namePlural: 'people',
          } as EnrichedObjectMetadataItem,
        } as Parameters<typeof RecordTableContextProvider>[0]['value']
      }
    >
      <RecordTableVirtualizedEvictRecordsCacheOnUnmountEffect />
    </RecordTableContextProvider>,
  );

describe('RecordTableVirtualizedEvictRecordsCacheOnUnmountEffect', () => {
  let cache: InMemoryCache;

  beforeEach(() => {
    cache = new InMemoryCache();
    cache.restore({
      ROOT_QUERY: {
        __typename: 'Query',
        'people({"first":60})': { edges: [] },
        'companies({"first":60})': { edges: [] },
      },
    });
    (useApolloCoreClient as jest.Mock).mockReturnValue({ cache });
  });

  const getRootQueryKeys = () => Object.keys(cache.extract().ROOT_QUERY ?? {});

  it('should keep the cached records while the table is mounted', () => {
    renderEffect(cache);

    expect(getRootQueryKeys()).toContain('people({"first":60})');
  });

  it('should evict the cached records of the table object on unmount', () => {
    const { unmount } = renderEffect(cache);

    unmount();

    expect(getRootQueryKeys()).not.toContain('people({"first":60})');
    expect(getRootQueryKeys()).toContain('companies({"first":60})');
  });
});
