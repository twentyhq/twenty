import { mapWebhookAnalyticsResultToNivoLineInput } from '@/analytics/utils/mapWebhookAnalyticsResultToNivoLineInput';

describe('mapWebhookAnalyticsResultToNivoLineInput', () => {
  it('should correctly map empty array', () => {
    const result = mapWebhookAnalyticsResultToNivoLineInput([]);
    expect(result).toEqual([]);
  });

  it('should correctly map single data point', () => {
    const input = [
      {
        start: '2024-01-01T00:00:00Z',
        success_count: 10,
        failure_count: 5,
      },
    ];

    const expected = [
      {
        id: 'Failed',
        data: [
          {
            x: new Date('2024-01-01T00:00:00Z'),
            y: 5,
          },
        ],
      },
      {
        id: 'Succeeded',
        data: [
          {
            x: new Date('2024-01-01T00:00:00Z'),
            y: 10,
          },
        ],
      },
    ];

    const result = mapWebhookAnalyticsResultToNivoLineInput(input);
    expect(result).toEqual(expected);
  });

  it('should correctly map multiple data points', () => {
    const input = [
      {
        start: '2024-01-01T00:00:00Z',
        success_count: 10,
        failure_count: 5,
      },
      {
        start: '2024-01-02T00:00:00Z',
        success_count: 15,
        failure_count: 3,
      },
    ];

    const expected = [
      {
        id: 'Failed',

        data: [
          {
            x: new Date('2024-01-01T00:00:00Z'),
            y: 5,
          },
          {
            x: new Date('2024-01-02T00:00:00Z'),
            y: 3,
          },
        ],
      },
      {
        id: 'Succeeded',

        data: [
          {
            x: new Date('2024-01-01T00:00:00Z'),
            y: 10,
          },
          {
            x: new Date('2024-01-02T00:00:00Z'),
            y: 15,
          },
        ],
      },
    ];

    const result = mapWebhookAnalyticsResultToNivoLineInput(input);
    expect(result).toEqual(expected);
  });

  it('should handle zero counts', () => {
    const input = [
      {
        start: '2024-01-01T00:00:00Z',
        success_count: 0,
        failure_count: 0,
      },
    ];

    const expected = [
      {
        id: 'Failed',

        data: [
          {
            x: new Date('2024-01-01T00:00:00Z'),
            y: 0,
          },
        ],
      },
      {
        id: 'Succeeded',

        data: [
          {
            x: new Date('2024-01-01T00:00:00Z'),
            y: 0,
          },
        ],
      },
    ];

    const result = mapWebhookAnalyticsResultToNivoLineInput(input);
    expect(result).toEqual(expected);
  });

  it('should preserve data point order', () => {
    const input = [
      {
        start: '2024-01-02T00:00:00Z',
        success_count: 15,
        failure_count: 3,
      },
      {
        start: '2024-01-01T00:00:00Z',
        success_count: 10,
        failure_count: 5,
      },
    ];

    const result = mapWebhookAnalyticsResultToNivoLineInput(input);

    // Check that dates in data arrays maintain input order
    expect(result[0].data[0].x).toEqual(new Date('2024-01-02T00:00:00Z'));
    expect(result[0].data[1].x).toEqual(new Date('2024-01-01T00:00:00Z'));
    expect(result[1].data[0].x).toEqual(new Date('2024-01-02T00:00:00Z'));
    expect(result[1].data[1].x).toEqual(new Date('2024-01-01T00:00:00Z'));
  });

  it('should handle malformed dates by creating invalid Date objects', () => {
    const input = [
      {
        start: 'invalid-date',
        success_count: 10,
        failure_count: 5,
      },
    ];

    const result = mapWebhookAnalyticsResultToNivoLineInput(input);

    expect(result[0].data[0].x.toString()).toBe('Invalid Date');
    expect(result[1].data[0].x.toString()).toBe('Invalid Date');
  });

  it('should maintain consistent structure with mixed data', () => {
    const input = [
      {
        start: '2024-01-01T00:00:00Z',
        success_count: 10,
        failure_count: 0,
      },
      {
        start: '2024-01-02T00:00:00Z',
        success_count: 0,
        failure_count: 5,
      },
    ];

    const result = mapWebhookAnalyticsResultToNivoLineInput(input);

    // Check both lines exist even when one has zero values
    expect(result.length).toBe(2);
    expect(result[0].data.length).toBe(2);
    expect(result[1].data.length).toBe(2);
  });
});
