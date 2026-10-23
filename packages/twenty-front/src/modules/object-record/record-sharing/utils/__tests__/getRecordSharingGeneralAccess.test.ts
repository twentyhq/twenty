import { i18n } from '@lingui/core';

import { getRecordSharingGeneralAccess } from '@/object-record/record-sharing/utils/getRecordSharingGeneralAccess';
import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

describe('getRecordSharingGeneralAccess', () => {
  it('includes application-managed access without an explicit workspace grant', () => {
    const generalAccess = getRecordSharingGeneralAccess({
      sharing: {
        generalAccessLevel: RecordShareAccessLevel.NONE,
        hasManagedGeneralAccess: true,
      },
      objectLabelPlural: 'Companies',
    });

    expect(generalAccess.hasGeneralAccess).toBe(true);
    expect(i18n._(generalAccess.label)).toBe(
      'Everyone with access to Companies',
    );
  });

  it('includes an explicit workspace grant without application-managed access', () => {
    expect(
      getRecordSharingGeneralAccess({
        sharing: {
          generalAccessLevel: RecordShareAccessLevel.READ,
          hasManagedGeneralAccess: false,
        },
        objectLabelPlural: 'Companies',
      }).hasGeneralAccess,
    ).toBe(true);
  });

  it('keeps restricted and unknown sharing without general access', () => {
    for (const sharing of [
      undefined,
      {
        generalAccessLevel: RecordShareAccessLevel.NONE,
        hasManagedGeneralAccess: false,
      },
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
