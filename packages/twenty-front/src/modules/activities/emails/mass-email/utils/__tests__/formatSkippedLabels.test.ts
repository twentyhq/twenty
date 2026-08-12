import { formatSkippedLabels } from '@/activities/emails/mass-email/utils/formatSkippedLabels';

describe('formatSkippedLabels', () => {
  it('should join a short list without a remainder', () => {
    expect(formatSkippedLabels(['Alice', 'Bob'])).toBe('Alice, Bob');
  });

  it('should list every label when exactly at the display limit', () => {
    expect(formatSkippedLabels(['A', 'B', 'C', 'D', 'E'])).toBe(
      'A, B, C, D, E',
    );
  });

  it('should collapse the tail into a count instead of dropping it', () => {
    expect(formatSkippedLabels(['A', 'B', 'C', 'D', 'E', 'F', 'G'])).toBe(
      'A, B, C, D, E +2 more',
    );
  });

  it('should return an empty string for no labels', () => {
    expect(formatSkippedLabels([])).toBe('');
  });
});
