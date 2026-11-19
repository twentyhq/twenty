import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { render } from '@testing-library/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { RecordTableVirtualizedEvictRecordsCacheOnUnmountEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedEvictRecordsCacheOnUnmountEffect';

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: jest.fn(),
}));

jest.mock('@/object-record/record-table/contexts/RecordTableContext', () => ({
  useRecordTableContextOrThrow: () => ({
    objectMetadataItem: { namePlural: 'people' },
  }),
}));

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
    jest
      .mocked(useApolloCoreClient)
      .mockReturnValue(new ApolloClient({ cache, link: ApolloLink.empty() }));
  });

  const getRootQueryKeys = () => Object.keys(cache.extract().ROOT_QUERY ?? {});

  it('should keep the cached records while the table is mounted', () => {
    render(<RecordTableVirtualizedEvictRecordsCacheOnUnmountEffect />);

    expect(getRootQueryKeys()).toContain('people({"first":60})');
  });

  it('should evict the cached records of the table object on unmount', () => {
    const { unmount } = render(
      <RecordTableVirtualizedEvictRecordsCacheOnUnmountEffect />,
    );

    unmount();

    expect(getRootQueryKeys()).not.toContain('people({"first":60})');
    expect(getRootQueryKeys()).toContain('companies({"first":60})');
  });
});
