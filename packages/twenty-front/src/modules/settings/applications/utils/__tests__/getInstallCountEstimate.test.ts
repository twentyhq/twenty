import { getInstallCountEstimate } from '@/settings/applications/utils/getInstallCountEstimate';

describe('getInstallCountEstimate', () => {
  it('returns no estimate below one thousand installs', () => {
    expect(getInstallCountEstimate(0)).toBeUndefined();
    expect(getInstallCountEstimate(999)).toBeUndefined();
  });

  it('rounds large install counts down to the nearest thousand', () => {
    expect(getInstallCountEstimate(1000)).toBe(1000);
    expect(getInstallCountEstimate(1098)).toBe(1000);
    expect(getInstallCountEstimate(9803)).toBe(9000);
    expect(getInstallCountEstimate(12345)).toBe(12000);
  });
});
