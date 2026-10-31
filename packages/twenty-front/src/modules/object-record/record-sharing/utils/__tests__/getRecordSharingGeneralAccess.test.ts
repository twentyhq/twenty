import { i18n } from '@lingui/core';

import { getRecordSharingGeneralAccess } from '@/object-record/record-sharing/utils/getRecordSharingGeneralAccess';

describe('getRecordSharingGeneralAccess', () => {
  it('includes application-managed access on a private record', () => {
    const generalAccess = getRecordSharingGeneralAccess({
      sharing: {
        isShareable: true,
        isPrivate: true,
        hasManagedGeneralAccess: true,
      },
      objectLabelPlural: 'Companies',
    });

    expect(generalAccess.hasGeneralAccess).toBe(true);
    expect(i18n._(generalAccess.label)).toBe(
      'Everyone with access to Companies',
    );
  });

  it('includes a record that follows its roles', () => {
    expect(
      getRecordSharingGeneralAccess({
        sharing: {
          isShareable: true,
          isPrivate: false,
          hasManagedGeneralAccess: false,
        },
        objectLabelPlural: 'Companies',
      }).hasGeneralAccess,
    ).toBe(true);
  });

  it('keeps private, role-only and unknown sharing without general access', () => {
    for (const sharing of [
      undefined,
      { isShareable: true, isPrivate: true, hasManagedGeneralAccess: false },
      { isShareable: false, isPrivate: false, hasManagedGeneralAccess: false },
    ]) {
      expect(
        getRecordSharingGeneralAccess({
          sharing,
          objectLabelPlural: 'Companies',
        }).hasGeneralAccess,
      ).toBe(false);
    }
  });
});
