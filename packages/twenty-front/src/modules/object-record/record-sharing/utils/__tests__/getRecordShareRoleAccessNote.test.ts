import { getRecordShareRoleAccessNote } from '@/object-record/record-sharing/utils/getRecordShareRoleAccessNote';
import {
  ObjectSharingReach,
  RecordShareAccessLevel,
} from '~/generated-metadata/graphql';

const OBJECT_LABEL_PLURAL = 'Opportunities';

const getNote = ({
  accessLevel = RecordShareAccessLevel.READ_WRITE,
  principalRole,
  sharingReach,
}: {
  accessLevel?: RecordShareAccessLevel;
  principalRole: { canRead: boolean; canUpdate: boolean } | undefined;
  sharingReach: ObjectSharingReach;
}) =>
  getRecordShareRoleAccessNote({
    accessLevel,
    principalRole,
    sharingReach,
    objectLabelPlural: OBJECT_LABEL_PLURAL,
  });

describe('getRecordShareRoleAccessNote', () => {
  it('should say nothing when the role of the recipient is unknown', () => {
    expect(
      getNote({
        principalRole: undefined,
        sharingReach: ObjectSharingReach.WORKSPACE,
      }),
    ).toBeUndefined();
  });

  it('should tell that a grant reaches beyond the role of its recipient', () => {
    expect(
      getNote({
        principalRole: { canRead: false, canUpdate: false },
        sharingReach: ObjectSharingReach.WORKSPACE,
      }),
    ).toBe("Gets this record only: their role can't access Opportunities");
  });

  it('should not warn about editing when the grant reaches beyond the role', () => {
    expect(
      getNote({
        principalRole: { canRead: true, canUpdate: false },
        sharingReach: ObjectSharingReach.WORKSPACE,
      }),
    ).toBeUndefined();
  });

  it('should warn that a grant does nothing when sharing stays within roles', () => {
    expect(
      getNote({
        principalRole: { canRead: false, canUpdate: false },
        sharingReach: ObjectSharingReach.ROLE_ACCESS,
      }),
    ).toBe("Won't see it: their role can't access Opportunities");
  });

  it('should warn that an edit grant only lets them view within roles', () => {
    expect(
      getNote({
        principalRole: { canRead: true, canUpdate: false },
        sharingReach: ObjectSharingReach.ROLE_ACCESS,
      }),
    ).toBe("Can only view: their role can't edit Opportunities");
    expect(
      getNote({
        accessLevel: RecordShareAccessLevel.READ,
        principalRole: { canRead: true, canUpdate: false },
        sharingReach: ObjectSharingReach.ROLE_ACCESS,
      }),
    ).toBeUndefined();
    expect(
      getNote({
        principalRole: { canRead: true, canUpdate: true },
        sharingReach: ObjectSharingReach.ROLE_ACCESS,
      }),
    ).toBeUndefined();
  });
});
