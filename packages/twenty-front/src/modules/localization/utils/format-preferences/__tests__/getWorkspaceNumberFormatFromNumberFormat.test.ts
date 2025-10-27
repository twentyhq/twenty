import { NumberFormat } from '@/localization/constants/NumberFormat';
import { getWorkspaceNumberFormatFromNumberFormat } from '@/localization/utils/format-preferences/getWorkspaceNumberFormatFromNumberFormat';
import { WorkspaceMemberNumberFormatEnum } from '~/generated/graphql';

describe('getWorkspaceNumberFormatFromNumberFormat', () => {
  it('should map NumberFormat to WorkspaceMemberNumberFormatEnum', () => {
    expect(
      getWorkspaceNumberFormatFromNumberFormat(NumberFormat.COMMAS_AND_DOT),
    ).toBe(WorkspaceMemberNumberFormatEnum.COMMAS_AND_DOT);
  });

  it('should return COMMAS_AND_DOT as default for unknown values', () => {
    expect(
      getWorkspaceNumberFormatFromNumberFormat('UNKNOWN' as NumberFormat),
    ).toBe(WorkspaceMemberNumberFormatEnum.COMMAS_AND_DOT);
  });
});
