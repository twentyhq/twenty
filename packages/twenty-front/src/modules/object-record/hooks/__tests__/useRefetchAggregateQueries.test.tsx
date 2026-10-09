import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { getGroupByAggregateQueryName } from '@/object-record/record-aggregate/utils/getGroupByAggregateQueryName';
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
    const objectMetadataNamePlural = 'opportunities';
    const expectedQueryName = getAggregateQueryName(objectMetadataNamePlural);
    const expectedQueryNameGroupBy = getGroupByAggregateQueryName({
      objectMetadataNamePlural,
    });

    const { result } = renderHook(() => useRefetchAggregateQueries());
    await result.current.refetchAggregateQueries({ objectMetadataNamePlural });

    expect(mockRefetchQueries).toHaveBeenCalledTimes(1);
    expect(mockRefetchQueries).toHaveBeenCalledWith({
      include: [expectedQueryName, expectedQueryNameGroupBy],
      onQueryUpdated: expect.any(Function),
    });
  });

  it('should not refetch skipped queries', async () => {
    const { result } = renderHook(() => useRefetchAggregateQueries());
    await result.current.refetchAggregateQueries({
      objectMetadataNamePlural: 'opportunities',
    });

    const { onQueryUpdated } = mockRefetchQueries.mock.calls[0][0];

    expect(onQueryUpdated({ options: { fetchPolicy: 'standby' } })).toBe(false);
    expect(onQueryUpdated({ options: { fetchPolicy: 'cache-first' } })).toBe(
      true,
    );
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
