import { DateFormat } from '@/localization/constants/DateFormat';
import { getWorkspaceDateFormatFromDateFormat } from '@/localization/utils/format-preferences/getWorkspaceDateFormatFromDateFormat';
import { WorkspaceMemberDateFormatEnum } from '~/generated/graphql';

describe('getWorkspaceDateFormatFromDateFormat', () => {
  it('should map DateFormat to WorkspaceMemberDateFormatEnum', () => {
    expect(getWorkspaceDateFormatFromDateFormat(DateFormat.MONTH_FIRST)).toBe(
      WorkspaceMemberDateFormatEnum.MONTH_FIRST,
    );
  });

  it('should return MONTH_FIRST as default for unknown values', () => {
    expect(
      getWorkspaceDateFormatFromDateFormat('UNKNOWN' as DateFormat),
    ).toBe(WorkspaceMemberDateFormatEnum.MONTH_FIRST);
  });
});

