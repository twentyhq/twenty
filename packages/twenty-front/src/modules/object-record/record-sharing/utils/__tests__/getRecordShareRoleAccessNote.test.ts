import { getRecordShareRoleAccessNote } from '@/object-record/record-sharing/utils/getRecordShareRoleAccessNote';
import {
  ObjectSharingReach,
  RecordShareAccessLevel,
} from '~/generated-metadata/graphql';

const OBJECT_LABEL_PLURAL = 'Opportunities';

const getNote = ({
  accessLevel = RecordShareAccessLevel.READ_WRITE,
  canRoleRead,
  canRoleUpdate = false,
  sharingReach,
}: {
  accessLevel?: RecordShareAccessLevel;
  canRoleRead: boolean | null;
  canRoleUpdate?: boolean | null;
  sharingReach: ObjectSharingReach;
}) =>
  getRecordShareRoleAccessNote({
    share: { accessLevel, canRoleRead, canRoleUpdate },
    sharingReach,
    objectLabelPlural: OBJECT_LABEL_PLURAL,
  });

describe('getRecordShareRoleAccessNote', () => {
  it('should say nothing about everyone, who has no single role', () => {
    expect(
      getNote({
        canRoleRead: null,
        sharingReach: ObjectSharingReach.WORKSPACE,
      }),
    ).toBeUndefined();
  });

  it('should tell that a grant reaches beyond the role of its recipient', () => {
    expect(
      getNote({
        canRoleRead: false,
        sharingReach: ObjectSharingReach.WORKSPACE,
      }),
    ).toBe("Gets this record only: their role can't access Opportunities");
  });

  it('should not warn about editing when the grant reaches beyond the role', () => {
    expect(
      getNote({
        canRoleRead: true,
        sharingReach: ObjectSharingReach.WORKSPACE,
      }),
    ).toBeUndefined();
  });

  it('should warn that a grant does nothing when sharing stays within roles', () => {
    expect(
      getNote({
        canRoleRead: false,
        sharingReach: ObjectSharingReach.ROLE_ACCESS,
      }),
    ).toBe("Won't see it: their role can't access Opportunities");
  });

  it('should warn that an edit grant only lets them view within roles', () => {
    expect(
      getNote({
        canRoleRead: true,
        sharingReach: ObjectSharingReach.ROLE_ACCESS,
      }),
    ).toBe("Can only view: their role can't edit Opportunities");
    expect(
      getNote({
        accessLevel: RecordShareAccessLevel.READ,
        canRoleRead: true,
        sharingReach: ObjectSharingReach.ROLE_ACCESS,
      }),
    ).toBeUndefined();
  });
});
