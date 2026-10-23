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
      workspaceName: 'Apple',
    });

    expect(generalAccess.hasGeneralAccess).toBe(true);
    expect(i18n._(generalAccess.label)).toBe('Everyone at Apple');
  });

  it('includes an explicit workspace grant without application-managed access', () => {
    expect(
      getRecordSharingGeneralAccess({
        sharing: {
          generalAccessLevel: RecordShareAccessLevel.READ,
          hasManagedGeneralAccess: false,
        },
        workspaceName: 'Apple',
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
          workspaceName: 'Apple',
        }).hasGeneralAccess,
      ).toBe(false);
    }
  });
});
