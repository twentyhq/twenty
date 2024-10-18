import { detectTimeFormat } from '@/localization/utils/detectTimeFormat';

describe('detectTimeFormat', () => {
  it('should return HOUR_12 if the hour format is 12-hour', () => {
    // Mock the resolvedOptions method to return hour12 as true
    const mockResolvedOptions = jest.fn(() => ({ hour12: true }));
    Intl.DateTimeFormat = jest.fn().mockImplementation(() => ({
      resolvedOptions: mockResolvedOptions,
    })) as any;

    const result = detectTimeFormat();

    expect(result).toBe('HOUR_12');
    expect(mockResolvedOptions).toHaveBeenCalled();
  });

  it('should return HOUR_24 if the hour format is 24-hour', () => {
    // Mock the resolvedOptions method to return hour12 as false
    const mockResolvedOptions = jest.fn(() => ({ hour12: false }));
    Intl.DateTimeFormat = jest.fn().mockImplementation(() => ({
      resolvedOptions: mockResolvedOptions,
    })) as any;

    const result = detectTimeFormat();

    expect(result).toBe('HOUR_24');
    expect(mockResolvedOptions).toHaveBeenCalled();
  });
});
