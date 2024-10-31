import { computeStartEndDate } from '@/analytics/utils/computeStartEndDate';

describe('computeStartEndDate', () => {
  // Store the original Date.now
  const originalDateNow = Date.now;

  // Mock date to ensure consistent testing
  beforeAll(() => {
    const mockDate = new Date('2024-01-15T10:30:00Z');
    global.Date.now = jest.fn(() => mockDate.getTime());
  });

  // Restore original Date.now
  afterAll(() => {
    global.Date.now = originalDateNow;
  });

  it('should compute correct range for 7D window', () => {
    const result = computeStartEndDate('7D');

    expect(result.start).toMatch(/^2024-01-08 10:30:00(\.\d{3})?$/);
    expect(result.end).toMatch(/^2024-01-15 10:30:00(\.\d{3})?$/);
  });

  it('should compute correct range for 1D window', () => {
    const result = computeStartEndDate('1D');

    expect(result.start).toMatch(/^2024-01-14 10:30:00(\.\d{3})?$/);
    expect(result.end).toMatch(/^2024-01-15 10:30:00(\.\d{3})?$/);
  });

  it('should compute correct range for 12H window', () => {
    const result = computeStartEndDate('12H');

    expect(result.start).toMatch(/^2024-01-14 22:30:00(\.\d{3})?$/);
    expect(result.end).toMatch(/^2024-01-15 10:30:00(\.\d{3})?$/);
  });

  it('should compute correct range for 4H window', () => {
    const result = computeStartEndDate('4H');

    expect(result.start).toMatch(/^2024-01-15 06:30:00(\.\d{3})?$/);
    expect(result.end).toMatch(/^2024-01-15 10:30:00(\.\d{3})?$/);
  });

  it('should handle DST transitions correctly', () => {
    // Mock date during DST transition
    const dstDate = new Date('2024-03-10T10:30:00Z'); // Around US DST transition
    global.Date.now = jest.fn(() => dstDate.getTime());

    const result = computeStartEndDate('1D');

    expect(result.start).toMatch(/^2024-03-09 10:30:00(\.\d{3})?$/);
    expect(result.end).toMatch(/^2024-03-10 10:30:00(\.\d{3})?$/);
  });

  it('should handle end of month transitions correctly', () => {
    // Mock date at end of month
    const endOfMonth = new Date('2024-01-31T10:30:00Z');
    global.Date.now = jest.fn(() => endOfMonth.getTime());

    const result = computeStartEndDate('1D');

    expect(result.start).toMatch(/^2024-01-30 10:30:00(\.\d{3})?$/);
    expect(result.end).toMatch(/^2024-01-31 10:30:00(\.\d{3})?$/);
  });

  it('should handle end of year transitions correctly', () => {
    // Mock date at end of year
    const endOfYear = new Date('2024-12-31T10:30:00Z');
    global.Date.now = jest.fn(() => endOfYear.getTime());

    const result = computeStartEndDate('7D');

    expect(result.start).toMatch(/^2024-12-24 10:30:00(\.\d{3})?$/);
    expect(result.end).toMatch(/^2024-12-31 10:30:00(\.\d{3})?$/);
  });

  it('should handle leap year correctly', () => {
    // Mock date near leap day
    const leapDay = new Date('2024-02-29T10:30:00Z');
    global.Date.now = jest.fn(() => leapDay.getTime());

    const result = computeStartEndDate('7D');

    expect(result.start).toMatch(/^2024-02-22 10:30:00(\.\d{3})?$/);
    expect(result.end).toMatch(/^2024-02-29 10:30:00(\.\d{3})?$/);
  });

  it('should return consistent string format', () => {
    const result = computeStartEndDate('1D');

    // Test format using regex that allows optional milliseconds
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{3})?$/;
    expect(result.start).toMatch(dateFormatRegex);
    expect(result.end).toMatch(dateFormatRegex);
  });

  it('should handle different timezones consistently', () => {
    // Save the original timezone
    const originalTimezone = process.env.TZ;

    try {
      // Test with different timezone
      process.env.TZ = 'America/New_York';

      const result = computeStartEndDate('1D');

      // Results should still be in the same format regardless of timezone
      const dateFormatRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{3})?$/;
      expect(result.start).toMatch(dateFormatRegex);
      expect(result.end).toMatch(dateFormatRegex);
    } finally {
      // Restore the original timezone
      process.env.TZ = originalTimezone;
    }
  });
});
