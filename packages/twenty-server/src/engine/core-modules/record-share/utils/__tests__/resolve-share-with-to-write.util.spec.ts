/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { RecordSharingMode } from 'src/engine/core-modules/record-share/enums/record-sharing-mode.enum';
import { resolveShareWithToWrite } from 'src/engine/core-modules/record-share/utils/resolve-share-with-to-write.util';

const ROLE_GRANT = {
  roleId: '20202020-0000-4000-8000-000000000001',
  accessLevel: RecordShareAccessLevel.READ,
};
const EVERYONE_GRANT = {
  everyone: true,
  accessLevel: RecordShareAccessLevel.READ,
};

describe('resolveShareWithToWrite', () => {
  it.each([RecordSharingMode.PRIVATE, RecordSharingMode.INHERITED])(
    'should write every entry, and the creator rows, on a %s object',
    (sharingMode) => {
      expect(
        resolveShareWithToWrite({
          sharingMode,
          shareWith: [ROLE_GRANT, EVERYONE_GRANT],
        }),
      ).toEqual([ROLE_GRANT, EVERYONE_GRANT]);
      expect(resolveShareWithToWrite({ sharingMode })).toEqual([]);
    },
  );

  it('should write the named grants of a record open by default', () => {
    expect(
      resolveShareWithToWrite({
        sharingMode: RecordSharingMode.OPEN_BY_DEFAULT,
        shareWith: [ROLE_GRANT, EVERYONE_GRANT],
      }),
    ).toEqual([ROLE_GRANT]);
  });

  it('should write nothing on a record open by default without named grants', () => {
    expect(
      resolveShareWithToWrite({
        sharingMode: RecordSharingMode.OPEN_BY_DEFAULT,
        shareWith: [EVERYONE_GRANT],
      }),
    ).toBeNull();
    expect(
      resolveShareWithToWrite({
        sharingMode: RecordSharingMode.OPEN_BY_DEFAULT,
        shareWith: null,
      }),
    ).toBeNull();
  });

  it('should write nothing when records of the object are not shared', () => {
    expect(
      resolveShareWithToWrite({
        sharingMode: RecordSharingMode.NONE,
        shareWith: [ROLE_GRANT],
      }),
    ).toBeNull();
  });
});
