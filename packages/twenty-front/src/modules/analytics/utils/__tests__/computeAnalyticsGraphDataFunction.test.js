import { computeAnalyticsGraphDataFunction } from '@/analytics/utils/computeAnalyticsGraphDataFunction';
import { mapServerlessFunctionDurationToNivoLineInput } from '@/analytics/utils/mapServerlessFunctionDurationToNivoLineInput';
import { mapServerlessFunctionErrorsToNivoLineInput } from '@/analytics/utils/mapServerlessFunctionErrorsToNivoLineInput';
import { mapWebhookAnalyticsResultToNivoLineInput } from '@/analytics/utils/mapWebhookAnalyticsResultToNivoLineInput';

jest.mock('@/analytics/utils/mapServerlessFunctionDurationToNivoLineInput');
jest.mock('@/analytics/utils/mapServerlessFunctionErrorsToNivoLineInput');
jest.mock('@/analytics/utils/mapWebhookAnalyticsResultToNivoLineInput');

describe('computeAnalyticsGraphDataFunction', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the mapWebhookAnalyticsResultToNivoLineInput function for "getWebhookAnalytics"', () => {
    const result = computeAnalyticsGraphDataFunction('getWebhookAnalytics');
    expect(result).toBe(mapWebhookAnalyticsResultToNivoLineInput);
  });

  it('should return the mapServerlessFunctionDurationToNivoLineInput function for "getServerlessFunctionDuration"', () => {
    const result = computeAnalyticsGraphDataFunction(
      'getServerlessFunctionDuration',
    );
    expect(result).toBe(mapServerlessFunctionDurationToNivoLineInput);
  });

  it('should return a function that calls mapServerlessFunctionErrorsToNivoLineInput with "ErrorCount" for "getServerlessFunctionErrorCount"', () => {
    const result = computeAnalyticsGraphDataFunction(
      'getServerlessFunctionErrorCount',
    );
    const data = [{ start: '2023-01-01', error_count: 10 }];
    result(data);
    expect(mapServerlessFunctionErrorsToNivoLineInput).toHaveBeenCalledWith(
      data,
      'ErrorCount',
    );
  });

  it('should return a function that calls mapServerlessFunctionErrorsToNivoLineInput with "SuccessRate" for "getServerlessFunctionSuccessRate"', () => {
    const result = computeAnalyticsGraphDataFunction(
      'getServerlessFunctionSuccessRate',
    );
    const data = [{ start: '2023-01-01', success_rate: 90 }];
    result(data);
    expect(mapServerlessFunctionErrorsToNivoLineInput).toHaveBeenCalledWith(
      data,
      'SuccessRate',
    );
  });

  it('should throw an error for an unknown endpoint', () => {
    expect(() => computeAnalyticsGraphDataFunction('unknown')).toThrowError(
      'No analytics function found associated with endpoint "unknown"',
    );
  });
});
