import { ANALYTICS_GRAPH_OPTION_MAP } from '@/analytics/constants/AnalyticsGraphOptionMap';
import { computeStartEndDate } from '@/analytics/utils/computeStartEndDate';
import { fetchGraphDataOrThrow } from '@/analytics/utils/fetchGraphDataOrThrow';

// Im going to make this test more contundent later
jest.mock('@/analytics/utils/computeStartEndDate', () => ({
  computeStartEndDate: jest.fn(() => ({
    start: '2024-01-01',
    end: '2024-01-07',
  })),
}));

describe('fetchGraphDataOrThrow', () => {
  // Setup fetch mock
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSuccessResponse = {
    data: [
      { timestamp: '2024-01-01', count: 10 },
      { timestamp: '2024-01-02', count: 20 },
    ],
  };

  const defaultProps = {
    recordId: 'test-123',
    windowLength: '7D',
    tinybirdJwt: 'test-jwt',
    endpointName: 'getWebhookAnalytics',
  };

  it('should fetch data successfully for webhook type', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSuccessResponse),
    });

    const result = await fetchGraphDataOrThrow(defaultProps);

    // Verify URL construction
    const lastCallArgs = mockFetch.mock.calls[0][0];
    expect(lastCallArgs).toContain('webhookId=test-123');
    expect(lastCallArgs).toContain('getWebhookAnalytics.json');

    // Verify headers
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe('Bearer test-jwt');

    // Verify response
    expect(result).toEqual(mockSuccessResponse.data);
  });

  it('should handle different window lengths correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSuccessResponse),
    });

    await fetchGraphDataOrThrow({
      ...defaultProps,
      windowLength: '1D',
    });

    // Verify that correct window length options were used
    const lastCallArgs = mockFetch.mock.calls[0][0];
    const options = ANALYTICS_GRAPH_OPTION_MAP['1D'];
    Object.entries(options).forEach(([key, value]) => {
      expect(lastCallArgs).toContain(`${key}=${value}`);
    });
  });

  it('should throw error on failed request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to fetch' }),
    });

    await expect(fetchGraphDataOrThrow(defaultProps)).rejects.toThrow(
      'Failed to fetch',
    );
  });

  it('should throw error on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchGraphDataOrThrow(defaultProps)).rejects.toThrow(
      'Network error',
    );
  });

  it('should use computed start and end dates', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSuccessResponse),
    });

    await fetchGraphDataOrThrow(defaultProps);

    // Verify computeStartEndDate was called with correct window length
    expect(computeStartEndDate).toHaveBeenCalledWith('7D');

    // Verify the computed dates are included in the URL
    const lastCallArgs = mockFetch.mock.calls[0][0];
    expect(lastCallArgs).toContain('start=2024-01-01');
    expect(lastCallArgs).toContain('end=2024-01-07');
  });

  it('should construct URL with all required parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSuccessResponse),
    });

    await fetchGraphDataOrThrow(defaultProps);

    const lastCallArgs = mockFetch.mock.calls[0][0];

    // Check base URL
    expect(lastCallArgs).toContain(
      'https://api.eu-central-1.aws.tinybird.co/v0/pipes/',
    );

    // Check endpoint
    expect(lastCallArgs).toContain('getWebhookAnalytics.json');

    // Check window length options
    const options = ANALYTICS_GRAPH_OPTION_MAP['7D'];
    Object.entries(options).forEach(([key, value]) => {
      expect(lastCallArgs).toContain(`${key}=${value}`);
    });

    // Check computed dates
    expect(lastCallArgs).toContain('start=2024-01-01');
    expect(lastCallArgs).toContain('end=2024-01-07');

    // Check record ID
    expect(lastCallArgs).toContain('webhookId=test-123');
  });
});
