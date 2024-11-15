import { mapServerlessFunctionErrorsToNivoLineInput } from '@/analytics/utils/mapServerlessFunctionErrorsToNivoLineInput';

describe('mapServerlessFunctionErrorsToNivoLineInput', () => {
  it('should map the serverless function result to Nivo line input format for error count', () => {
    const serverlessFunctionResult = [
      { start: '2023-01-01', error_count: 10, success_rate: 0.66 },
      { start: '2023-01-02', error_count: 5, success_rate: 0.75 },
      { start: '2023-01-03', error_count: 8, success_rate: 0.69 },
    ];

    const expected = [
      {
        id: 'Error',
        data: [
          { x: new Date('2023-01-01'), y: 10 },
          { x: new Date('2023-01-02'), y: 5 },
          { x: new Date('2023-01-03'), y: 8 },
        ],
      },
    ];

    const result = mapServerlessFunctionErrorsToNivoLineInput(
      serverlessFunctionResult,
      'ErrorCount',
    );
    expect(result).toEqual(expected);
  });

  it('should map the serverless function result to Nivo line input format for success rate', () => {
    const serverlessFunctionResult = [
      { start: '2023-01-01', error_count: 10, success_rate: 0.66 },
      { start: '2023-01-02', error_count: 5, success_rate: 0.75 },
      { start: '2023-01-03', error_count: 8, success_rate: 0.69 },
    ];

    const expected = [
      {
        id: 'Success Rate',
        data: [
          { x: new Date('2023-01-01'), y: 0.66 },
          { x: new Date('2023-01-02'), y: 0.75 },
          { x: new Date('2023-01-03'), y: 0.69 },
        ],
      },
    ];

    const result = mapServerlessFunctionErrorsToNivoLineInput(
      serverlessFunctionResult,
      'SuccessRate',
    );
    expect(result).toEqual(expected);
  });

  it('should handle empty input', () => {
    const serverlessFunctionResult = [];
    const expected = [
      {
        id: 'Error',
        data: [],
      },
    ];
    const result = mapServerlessFunctionErrorsToNivoLineInput(
      serverlessFunctionResult,
      'ErrorCount',
    );
    expect(result).toEqual(expected);
  });
});
