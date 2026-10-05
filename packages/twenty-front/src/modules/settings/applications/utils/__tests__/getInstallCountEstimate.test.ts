import { getInstallCountEstimate } from '@/settings/applications/utils/getInstallCountEstimate';

describe('getInstallCountEstimate', () => {
  it('keeps counts under ten exact', () => {
    expect(getInstallCountEstimate(0)).toBeUndefined();
    expect(getInstallCountEstimate(9)).toBeUndefined();
  });

  it('rounds counts down to their order of magnitude', () => {
    expect(getInstallCountEstimate(47)).toBe(40);
    expect(getInstallCountEstimate(742)).toBe(700);
    expect(getInstallCountEstimate(1098)).toBe(1000);
    expect(getInstallCountEstimate(9803)).toBe(9000);
    expect(getInstallCountEstimate(12345)).toBe(10000);
  });

  it('keeps counts that are already round exact', () => {
    expect(getInstallCountEstimate(40)).toBeUndefined();
    expect(getInstallCountEstimate(1000)).toBeUndefined();
  });
});
