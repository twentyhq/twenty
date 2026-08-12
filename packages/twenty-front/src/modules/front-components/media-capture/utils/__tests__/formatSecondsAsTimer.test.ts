import { formatSecondsAsTimer } from '@/front-components/media-capture/utils/formatSecondsAsTimer';

describe('formatSecondsAsTimer', () => {
  it('should format zero as 00:00', () => {
    expect(formatSecondsAsTimer(0)).toBe('00:00');
  });

  it('should format seconds with zero padding', () => {
    expect(formatSecondsAsTimer(7)).toBe('00:07');
    expect(formatSecondsAsTimer(65)).toBe('01:05');
    expect(formatSecondsAsTimer(600)).toBe('10:00');
  });

  it('should clamp negative and fractional values', () => {
    expect(formatSecondsAsTimer(-5)).toBe('00:00');
    expect(formatSecondsAsTimer(61.9)).toBe('01:01');
  });
});
