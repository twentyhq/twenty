import { formatQueueJobProgressLabel } from '@/queue-job/utils/formatQueueJobProgressLabel';

describe('formatQueueJobProgressLabel', () => {
  it('pads a single-digit percentage with a figure space', () => {
    expect(formatQueueJobProgressLabel(0)).toBe(' (0%)');
    expect(formatQueueJobProgressLabel(7)).toBe(' (7%)');
  });

  it('leaves a two-digit percentage unpadded', () => {
    expect(formatQueueJobProgressLabel(10)).toBe('(10%)');
    expect(formatQueueJobProgressLabel(42)).toBe('(42%)');
    expect(formatQueueJobProgressLabel(100)).toBe('(100%)');
  });

  it('rounds the percentage', () => {
    expect(formatQueueJobProgressLabel(9.6)).toBe('(10%)');
    expect(formatQueueJobProgressLabel(42.4)).toBe('(42%)');
  });
});
