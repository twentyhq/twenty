import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { renderHook } from '@testing-library/react';

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: jest.fn(),
}));

describe('useRefetchAggregateQueries', () => {
  const mockRefetchQueries = jest.fn();
  const mockApolloClient = {
    refetchQueries: mockRefetchQueries,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useApolloCoreClient as jest.Mock).mockReturnValue(mockApolloClient);
  });

  it('should refetch queries by evicting cache for the object', async () => {
    const objectMetadataNamePlural = 'opportunities';

    const { result } = renderHook(() => useRefetchAggregateQueries());
    await result.current.refetchAggregateQueries({ objectMetadataNamePlural });

    expect(mockRefetchQueries).toHaveBeenCalledTimes(1);
    expect(mockRefetchQueries).toHaveBeenCalledWith({
      updateCache: expect.any(Function),
    });

    // Verify the updateCache callback evicts the correct field
    const mockCache = { evict: jest.fn() };
    const { updateCache } = mockRefetchQueries.mock.calls[0][0];
    updateCache(mockCache);
    expect(mockCache.evict).toHaveBeenCalledWith({
      fieldName: objectMetadataNamePlural,
    });
  });

  it('should handle errors during refetch', async () => {
    const error = new Error('Refetch failed');
    mockRefetchQueries.mockRejectedValue(error);
    const objectMetadataNamePlural = 'opportunities';

    const { result } = renderHook(() => useRefetchAggregateQueries());

    await expect(
      result.current.refetchAggregateQueries({ objectMetadataNamePlural }),
    ).rejects.toThrow('Refetch failed');
  });
});
