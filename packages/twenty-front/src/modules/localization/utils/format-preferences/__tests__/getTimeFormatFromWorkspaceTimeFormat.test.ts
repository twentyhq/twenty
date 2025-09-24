import { TimeFormat } from '@/localization/constants/TimeFormat';
import { getTimeFormatFromWorkspaceTimeFormat } from '@/localization/utils/format-preferences/getTimeFormatFromWorkspaceTimeFormat';
import { WorkspaceMemberTimeFormatEnum } from '~/generated/graphql';

// Mock detectTimeFormat
jest.mock('@/localization/utils/detection/detectTimeFormat', () => ({
  detectTimeFormat: jest.fn(() => 'HOUR_12'),
}));

describe('getTimeFormatFromWorkspaceTimeFormat', () => {
  it('should return HOUR_24 for HOUR_24 workspace format', () => {
    expect(
      getTimeFormatFromWorkspaceTimeFormat(
        WorkspaceMemberTimeFormatEnum.HOUR_24,
      ),
    ).toBe(TimeFormat.HOUR_24);
  });

  it('should return HOUR_12 for HOUR_12 workspace format', () => {
    expect(
      getTimeFormatFromWorkspaceTimeFormat(
        WorkspaceMemberTimeFormatEnum.HOUR_12,
      ),
    ).toBe(TimeFormat.HOUR_12);
  });

  it('should return detected format for SYSTEM workspace format', () => {
    expect(
      getTimeFormatFromWorkspaceTimeFormat(
        WorkspaceMemberTimeFormatEnum.SYSTEM,
      ),
    ).toBe(TimeFormat.HOUR_12);
  });

  it('should return HOUR_24 for unknown format', () => {
    expect(
      getTimeFormatFromWorkspaceTimeFormat(
        'UNKNOWN' as WorkspaceMemberTimeFormatEnum,
      ),
    ).toBe(TimeFormat.HOUR_24);
  });
});
