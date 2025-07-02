import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { getAggregateQueryName } from '@/object-record/utils/getAggregateQueryName';
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

  it('should refetch queries', async () => {
    // Arrange
    const objectMetadataNamePlural = 'opportunities';
    const expectedQueryName = getAggregateQueryName(objectMetadataNamePlural);

    // Act
    const { result } = renderHook(() =>
      useRefetchAggregateQueries({ objectMetadataNamePlural }),
    );
    await result.current.refetchAggregateQueries();

    // Assert
    expect(mockRefetchQueries).toHaveBeenCalledTimes(1);
    expect(mockRefetchQueries).toHaveBeenCalledWith({
      include: [expectedQueryName],
    });
  });

  it('should handle errors during refetch', async () => {
    // Arrange
    const error = new Error('Refetch failed');
    mockRefetchQueries.mockRejectedValue(error);
    const objectMetadataNamePlural = 'opportunities';

    // Act
    const { result } = renderHook(() =>
      useRefetchAggregateQueries({ objectMetadataNamePlural }),
    );

    // Assert
    await expect(result.current.refetchAggregateQueries()).rejects.toThrow(
      'Refetch failed',
    );
  });
});
