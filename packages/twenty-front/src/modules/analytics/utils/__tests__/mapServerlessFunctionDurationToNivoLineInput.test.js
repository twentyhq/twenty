import { mapServerlessFunctionDurationToNivoLineInput } from '@/analytics/utils/mapServerlessFunctionDurationToNivoLineInput';

describe('mapServerlessFunctionDurationToNivoLineInput', () => {
  it('should convert the serverless function duration result to NivoLineInput format', () => {
    const serverlessFunctionDurationResult = [
      {
        start: '2023-01-01T00:00:00.000Z',
        minimum: 100,
        maximum: 200,
        average: 150,
      },
      {
        start: '2023-01-02T00:00:00.000Z',
        minimum: 80,
        maximum: 160,
        average: 120,
      },
      {
        start: '2023-01-03T00:00:00.000Z',
        minimum: 90,
        maximum: 180,
        average: 135,
      },
    ];

    const expected = [
      {
        id: 'Maximum',
        data: [
          { x: new Date('2023-01-01T00:00:00.000Z'), y: 200 },
          { x: new Date('2023-01-02T00:00:00.000Z'), y: 160 },
          { x: new Date('2023-01-03T00:00:00.000Z'), y: 180 },
        ],
      },
      {
        id: 'Minimum',
        data: [
          { x: new Date('2023-01-01T00:00:00.000Z'), y: 100 },
          { x: new Date('2023-01-02T00:00:00.000Z'), y: 80 },
          { x: new Date('2023-01-03T00:00:00.000Z'), y: 90 },
        ],
      },
      {
        id: 'Average',
        data: [
          { x: new Date('2023-01-01T00:00:00.000Z'), y: 150 },
          { x: new Date('2023-01-02T00:00:00.000Z'), y: 120 },
          { x: new Date('2023-01-03T00:00:00.000Z'), y: 135 },
        ],
      },
    ];

    const result = mapServerlessFunctionDurationToNivoLineInput(
      serverlessFunctionDurationResult,
    );
    expect(result).toEqual(expected);
  });
  it('should handle an empty serverless function duration result', () => {
    const serverlessFunctionDurationResult = [];
    const result = mapServerlessFunctionDurationToNivoLineInput(
      serverlessFunctionDurationResult,
    );
    expect(result).toEqual([]);
  });
});
