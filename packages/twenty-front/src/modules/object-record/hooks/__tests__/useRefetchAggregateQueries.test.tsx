import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { getGroupByAggregateQueryName } from '@/object-record/record-aggregate/utils/getGroupByAggregateQueryName';
import { getAggregateQueryName } from '@/object-record/utils/getAggregateQueryName';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: vi.fn(),
}));

describe('useRefetchAggregateQueries', () => {
  const mockRefetchQueries = vi.fn();
  const mockApolloClient = new ApolloClient({
    uri: 'http://localhost',
    cache: new InMemoryCache(),
  });
  Object.defineProperty(mockApolloClient, 'refetchQueries', {
    value: mockRefetchQueries,
    writable: true,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApolloCoreClient).mockReturnValue(mockApolloClient);
  });

  it('should refetch queries', async () => {
    // Arrange
    const objectMetadataNamePlural = 'opportunities';
    const expectedQueryName = getAggregateQueryName(objectMetadataNamePlural);
    const expectedQueryNameGroupBy = getGroupByAggregateQueryName({
      objectMetadataNamePlural,
    });

    // Act
    const { result } = renderHook(() => useRefetchAggregateQueries());
    await result.current.refetchAggregateQueries({ objectMetadataNamePlural });

    // Assert
    expect(mockRefetchQueries).toHaveBeenCalledTimes(1);
    expect(mockRefetchQueries).toHaveBeenCalledWith({
      include: [expectedQueryName, expectedQueryNameGroupBy],
    });
  });

  it('should handle errors during refetch', async () => {
    // Arrange
    const error = new Error('Refetch failed');
    mockRefetchQueries.mockRejectedValue(error);
    const objectMetadataNamePlural = 'opportunities';

    // Act
    const { result } = renderHook(() => useRefetchAggregateQueries());

    // Assert
    await expect(
      result.current.refetchAggregateQueries({ objectMetadataNamePlural }),
    ).rejects.toThrow('Refetch failed');
  });
});
