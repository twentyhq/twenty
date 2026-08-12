import { normalizeMediaCaptureMaxDurationSeconds } from '@/front-components/media-capture/utils/normalizeMediaCaptureMaxDurationSeconds';

describe('normalizeMediaCaptureMaxDurationSeconds', () => {
  it('should default when no duration is requested', () => {
    expect(normalizeMediaCaptureMaxDurationSeconds(undefined)).toBe(300);
  });

  it('should default on non-finite values', () => {
    expect(normalizeMediaCaptureMaxDurationSeconds(Number.NaN)).toBe(300);
    expect(normalizeMediaCaptureMaxDurationSeconds(Infinity)).toBe(300);
  });

  it('should clamp to the ceiling', () => {
    expect(normalizeMediaCaptureMaxDurationSeconds(999999)).toBe(600);
  });

  it('should clamp to the floor and drop fractions', () => {
    expect(normalizeMediaCaptureMaxDurationSeconds(0)).toBe(1);
    expect(normalizeMediaCaptureMaxDurationSeconds(-5)).toBe(1);
    expect(normalizeMediaCaptureMaxDurationSeconds(120.9)).toBe(120);
  });
});
