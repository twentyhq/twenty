import { WEBHOOK_GRAPH_API_OPTIONS_MAP } from '@/settings/developers/webhook/constants/WebhookGraphApiOptionsMap';
import { fetchGraphDataOrThrow } from '@/settings/developers/webhook/utils/fetchGraphDataOrThrow';

// Mock the global fetch function
global.fetch = jest.fn();

describe('fetchGraphDataOrThrow', () => {
  const mockWebhookId = 'test-webhook-id';
  const mockWindowLength = '7D';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch and transform data successfully', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: [
          { start_interval: '2023-05-01', failure_count: 2, success_count: 8 },
          { start_interval: '2023-05-02', failure_count: 1, success_count: 9 },
        ],
      }),
    };
    global.fetch.mockResolvedValue(mockResponse);

    const result = await fetchGraphDataOrThrow({
      webhookId: mockWebhookId,
      windowLength: mockWindowLength,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        `https://api.eu-central-1.aws.tinybird.co/v0/pipes/getWebhooksAnalyticsV2.json?`,
      ),
      expect.objectContaining({
        headers: {
          Authorization: expect.stringContaining('Bearer '),
        },
      }),
    );

    expect(result).toEqual([
      {
        id: 'Failed',
        color: 'red',
        data: [
          { x: '2023-05-01', y: 2 },
          { x: '2023-05-02', y: 1 },
        ],
      },
      {
        id: 'Succeeded',
        color: 'blue',
        data: [
          { x: '2023-05-01', y: 8 },
          { x: '2023-05-02', y: 9 },
        ],
      },
    ]);
  });

  it('should throw an error when the response is not ok', async () => {
    const mockResponse = {
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Some error' }),
    };
    global.fetch.mockResolvedValue(mockResponse);

    await expect(
      fetchGraphDataOrThrow({
        webhookId: mockWebhookId,
        windowLength: mockWindowLength,
      }),
    ).rejects.toThrow('Something went wrong while fetching webhook usage');
  });

  it('should use correct query parameters based on window length', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ data: [] }),
    };
    global.fetch.mockResolvedValue(mockResponse);

    await fetchGraphDataOrThrow({
      webhookId: mockWebhookId,
      windowLength: '1D',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        new URLSearchParams({
          ...WEBHOOK_GRAPH_API_OPTIONS_MAP['1D'],
          webhookIdRequest: mockWebhookId,
        }).toString(),
      ),
      expect.any(Object),
    );
  });

  it('should handle empty response data', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ data: [] }),
    };
    global.fetch.mockResolvedValue(mockResponse);

    const result = await fetchGraphDataOrThrow({
      webhookId: mockWebhookId,
      windowLength: mockWindowLength,
    });

    expect(result).toEqual([]);
  });
});
