import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';

describe('truncateTickLabel', () => {
  it('should return the original string when it fits within maxLength', () => {
    expect(truncateTickLabel('Hello', 10)).toBe('Hello');
    expect(truncateTickLabel('Test', 4)).toBe('Test');
  });

  it('should truncate and add ellipsis when string exceeds maxLength', () => {
    expect(truncateTickLabel('Hello World', 8)).toBe('Hello...');
    expect(truncateTickLabel('LongLabel', 6)).toBe('Lon...');
  });

  it('should handle numeric values', () => {
    expect(truncateTickLabel(12345, 4)).toBe('1...');
    expect(truncateTickLabel(12345, 10)).toBe('12345');
  });

  it('should return partial ellipsis when maxLength is 3 or less', () => {
    expect(truncateTickLabel('Hello', 3)).toBe('...');
    expect(truncateTickLabel('Hello', 2)).toBe('..');
    expect(truncateTickLabel('Hello', 1)).toBe('.');
  });

  it('should handle maxLength of 0', () => {
    expect(truncateTickLabel('Hello', 0)).toBe('');
  });

  it('should handle empty string', () => {
    expect(truncateTickLabel('', 5)).toBe('');
  });

  it('should handle maxLength equal to string length', () => {
    expect(truncateTickLabel('Hello', 5)).toBe('Hello');
  });

  it('should handle maxLength of 4 correctly', () => {
    expect(truncateTickLabel('Hello', 4)).toBe('H...');
  });
});
