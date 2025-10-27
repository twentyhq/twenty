import { TimeFormat } from '@/localization/constants/TimeFormat';
import { getWorkspaceTimeFormatFromTimeFormat } from '@/localization/utils/format-preferences/getWorkspaceTimeFormatFromTimeFormat';
import { WorkspaceMemberTimeFormatEnum } from '~/generated/graphql';

describe('getWorkspaceTimeFormatFromTimeFormat', () => {
  it('should map TimeFormat to WorkspaceMemberTimeFormatEnum', () => {
    expect(getWorkspaceTimeFormatFromTimeFormat(TimeFormat.HOUR_24)).toBe(
      WorkspaceMemberTimeFormatEnum.HOUR_24,
    );
  });

  it('should return HOUR_24 as default for unknown values', () => {
    expect(
      getWorkspaceTimeFormatFromTimeFormat('UNKNOWN' as TimeFormat),
    ).toBe(WorkspaceMemberTimeFormatEnum.HOUR_24);
  });
});

