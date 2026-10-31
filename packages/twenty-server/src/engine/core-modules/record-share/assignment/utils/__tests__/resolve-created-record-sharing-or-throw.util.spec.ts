/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { resolveCreatedRecordSharingOrThrow } from 'src/engine/core-modules/record-share/assignment/utils/resolve-created-record-sharing-or-throw.util';

const ROLE_GRANT = {
  roleId: '20202020-0000-4000-8000-000000000001',
  accessLevel: RecordShareAccessLevel.READ,
};
const EVERYONE_GRANT = {
  everyone: true,
  accessLevel: RecordShareAccessLevel.READ,
};
const EVERYONE_NONE = {
  everyone: true,
  accessLevel: RecordShareAccessLevel.NONE,
};
const EVERYONE_AT_DEFAULT = {
  everyone: true,
  accessLevel: RecordShareAccessLevel.READ_WRITE,
};
const SHARE_REQUIRED_OBJECT = {
  isShareable: true,
  isShareRequired: true,
  defaultGeneralAccessLevel: RecordShareAccessLevel.NONE,
};
const SHAREABLE_OBJECT = {
  isShareable: true,
  isShareRequired: false,
  defaultGeneralAccessLevel: RecordShareAccessLevel.READ_WRITE,
};
const ROLE_ONLY_OBJECT = {
  isShareable: false,
  isShareRequired: false,
  defaultGeneralAccessLevel: null,
};

describe('resolveCreatedRecordSharingOrThrow', () => {
  it('should write every entry, and the creator rows, on an object whose records need a share', () => {
    expect(
      resolveCreatedRecordSharingOrThrow({
        objectSharing: SHARE_REQUIRED_OBJECT,
        shareWith: [ROLE_GRANT, EVERYONE_GRANT],
      }),
    ).toEqual({ shareWith: [ROLE_GRANT, EVERYONE_GRANT], isPrivate: false });
    expect(
      resolveCreatedRecordSharingOrThrow({
        objectSharing: SHARE_REQUIRED_OBJECT,
      }),
    ).toEqual({ shareWith: [], isPrivate: false });
  });

  it('should leave no everyone row when everyone keeps the default of an object whose records need a share', () => {
    expect(
      resolveCreatedRecordSharingOrThrow({
        objectSharing: SHARE_REQUIRED_OBJECT,
        shareWith: [ROLE_GRANT, EVERYONE_NONE],
      }),
    ).toEqual({ shareWith: [ROLE_GRANT], isPrivate: false });
  });

  it('should create private records when everyone gets no access', () => {
    expect(
      resolveCreatedRecordSharingOrThrow({
        objectSharing: SHAREABLE_OBJECT,
        shareWith: [ROLE_GRANT, EVERYONE_NONE],
      }),
    ).toEqual({ shareWith: [ROLE_GRANT], isPrivate: true });
    expect(
      resolveCreatedRecordSharingOrThrow({
        objectSharing: SHAREABLE_OBJECT,
        shareWith: [EVERYONE_NONE],
      }),
    ).toEqual({ shareWith: [], isPrivate: true });
  });

  it('should write named grants on a public record', () => {
    expect(
      resolveCreatedRecordSharingOrThrow({
        objectSharing: SHAREABLE_OBJECT,
        shareWith: [ROLE_GRANT, EVERYONE_AT_DEFAULT],
      }),
    ).toEqual({ shareWith: [ROLE_GRANT], isPrivate: false });
  });

  it('should write nothing for a public record without named grants', () => {
    expect(
      resolveCreatedRecordSharingOrThrow({
        objectSharing: SHAREABLE_OBJECT,
        shareWith: [EVERYONE_AT_DEFAULT],
      }),
    ).toBeNull();
    expect(
      resolveCreatedRecordSharingOrThrow({
        objectSharing: SHAREABLE_OBJECT,
        shareWith: null,
      }),
    ).toBeNull();
  });

  it('should reject a view-only general access, which private records replace', () => {
    expect(() =>
      resolveCreatedRecordSharingOrThrow({
        objectSharing: SHAREABLE_OBJECT,
        shareWith: [EVERYONE_GRANT],
      }),
    ).toThrow('A record is either private or follows the roles of its object');
  });

  it('should write nothing when records of the object are not shared', () => {
    expect(
      resolveCreatedRecordSharingOrThrow({
        objectSharing: ROLE_ONLY_OBJECT,
        shareWith: [ROLE_GRANT],
      }),
    ).toBeNull();
  });
});
