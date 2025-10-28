import { DateFormat } from '@/localization/constants/DateFormat';
import { getDateFormatFromWorkspaceDateFormat } from '@/localization/utils/format-preferences/getDateFormatFromWorkspaceDateFormat';
import { WorkspaceMemberDateFormatEnum } from '~/generated/graphql';

// Mock detectDateFormat
jest.mock('@/localization/utils/detection/detectDateFormat', () => ({
  detectDateFormat: jest.fn(() => 'MONTH_FIRST'),
}));

describe('getDateFormatFromWorkspaceDateFormat', () => {
  it('should return MONTH_FIRST for MONTH_FIRST workspace format', () => {
    expect(
      getDateFormatFromWorkspaceDateFormat(
        WorkspaceMemberDateFormatEnum.MONTH_FIRST,
      ),
    ).toBe(DateFormat.MONTH_FIRST);
  });

  it('should return DAY_FIRST for DAY_FIRST workspace format', () => {
    expect(
      getDateFormatFromWorkspaceDateFormat(
        WorkspaceMemberDateFormatEnum.DAY_FIRST,
      ),
    ).toBe(DateFormat.DAY_FIRST);
  });

  it('should return YEAR_FIRST for YEAR_FIRST workspace format', () => {
    expect(
      getDateFormatFromWorkspaceDateFormat(
        WorkspaceMemberDateFormatEnum.YEAR_FIRST,
      ),
    ).toBe(DateFormat.YEAR_FIRST);
  });

  it('should return detected format for SYSTEM workspace format', () => {
    expect(
      getDateFormatFromWorkspaceDateFormat(
        WorkspaceMemberDateFormatEnum.SYSTEM,
      ),
    ).toBe(DateFormat.MONTH_FIRST);
  });

  it('should return MONTH_FIRST for unknown format', () => {
    expect(
      getDateFormatFromWorkspaceDateFormat(
        'UNKNOWN' as WorkspaceMemberDateFormatEnum,
      ),
    ).toBe(DateFormat.MONTH_FIRST);
  });
});
