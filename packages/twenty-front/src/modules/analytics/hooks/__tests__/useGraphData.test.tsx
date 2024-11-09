import { useAnalyticsTinybirdJwts } from '@/analytics/hooks/useAnalyticsTinybirdJwts';
import { useGraphData } from '@/analytics/hooks/useGraphData';
import { fetchGraphDataOrThrow } from '@/analytics/utils/fetchGraphDataOrThrow';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { renderHook } from '@testing-library/react';
jest.mock('@/analytics/hooks/useAnalyticsTinybirdJwts');
jest.mock('@/analytics/utils/fetchGraphDataOrThrow');
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar');

describe('useGraphData', () => {
  const mockEnqueueSnackBar = jest.fn();
  const mockUseSnackBar = jest.fn().mockReturnValue({
    enqueueSnackBar: mockEnqueueSnackBar,
  });

  const mockUseAnalyticsTinybirdJwts = jest.fn();
  const mockFetchGraphDataOrThrow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSnackBar as jest.MockedFunction<typeof useSnackBar>).mockImplementation(
      mockUseSnackBar,
    );
    (
      useAnalyticsTinybirdJwts as jest.MockedFunction<
        typeof useAnalyticsTinybirdJwts
      >
    ).mockImplementation(mockUseAnalyticsTinybirdJwts);
    (
      fetchGraphDataOrThrow as jest.MockedFunction<typeof fetchGraphDataOrThrow>
    ).mockImplementation(mockFetchGraphDataOrThrow);
  });

  it('should fetch graph data successfully', async () => {
    const mockJwt = 'mock-jwt';
    const mockRecordId = 'mock-record-id';
    const mockEndpointName = 'getWebhookAnalytics';
    const mockGraphData = [{ x: '2023-01-01', y: 100 }];

    mockUseAnalyticsTinybirdJwts.mockReturnValue(mockJwt);
    mockFetchGraphDataOrThrow.mockResolvedValue(mockGraphData);

    const { result } = renderHook(() =>
      useGraphData({ recordId: mockRecordId, endpointName: mockEndpointName }),
    );
    const { fetchGraphData } = result.current;

    const data = await fetchGraphData('7D');
    expect(data).toEqual(mockGraphData);
    expect(mockFetchGraphDataOrThrow).toHaveBeenCalledWith({
      recordId: mockRecordId,
      windowLength: '7D',
      tinybirdJwt: mockJwt,
      endpointName: mockEndpointName,
    });
    expect(mockEnqueueSnackBar).not.toHaveBeenCalled();
  });
  it('should handle errors when fetching graph data', async () => {
    const mockRecordId = 'mock-record-id';
    const mockEndpointName = 'getWebhookAnalytics';
    const mockError = new Error('Something went wrong');

    mockUseAnalyticsTinybirdJwts.mockReturnValue('');
    mockFetchGraphDataOrThrow.mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useGraphData({ recordId: mockRecordId, endpointName: mockEndpointName }),
    );
    const { fetchGraphData } = result.current;

    const data = await fetchGraphData('7D');
    expect(data).toEqual([]);
    expect(mockFetchGraphDataOrThrow).toHaveBeenCalledWith({
      recordId: mockRecordId,
      windowLength: '7D',
      tinybirdJwt: '',
      endpointName: mockEndpointName,
    });
    expect(mockEnqueueSnackBar).toHaveBeenCalledWith(
      'Something went wrong while fetching webhook usage: Something went wrong',
      {
        variant: SnackBarVariant.Error,
      },
    );
  });
});
