import { TimeFormat } from '@/localization/constants/TimeFormat';
import { resolveTimeFormat } from '@/localization/utils/resolveTimeFormat';

jest.mock('@/localization/utils/detection/detectTimeFormat', () => ({
  detectTimeFormat: jest.fn(() => 'HOUR_24'),
}));

describe('resolveTimeFormat', () => {
  it('should detect system format when SYSTEM is passed', () => {
    const result = resolveTimeFormat(TimeFormat.SYSTEM);

    expect(result).toBe(TimeFormat.HOUR_24);
  });

  it('should return HOUR_24 as-is', () => {
    expect(resolveTimeFormat(TimeFormat.HOUR_24)).toBe(TimeFormat.HOUR_24);
  });

  it('should return HOUR_12 as-is', () => {
    expect(resolveTimeFormat(TimeFormat.HOUR_12)).toBe(TimeFormat.HOUR_12);
  });
});
