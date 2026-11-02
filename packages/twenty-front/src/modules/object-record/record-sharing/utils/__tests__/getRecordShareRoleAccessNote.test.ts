import { getRecordShareRoleAccessNote } from '@/object-record/record-sharing/utils/getRecordShareRoleAccessNote';

const OBJECT_LABEL_PLURAL = 'Opportunities';

const getNote = (principalRole: { canRead: boolean | null } | undefined) =>
  getRecordShareRoleAccessNote({
    principalRole,
    objectLabelPlural: OBJECT_LABEL_PLURAL,
  });

describe('getRecordShareRoleAccessNote', () => {
  it('should say nothing when the role of the recipient is unknown', () => {
    expect(getNote(undefined)).toBeUndefined();
  });

  it('should say nothing when the access of the role is unknown', () => {
    expect(getNote({ canRead: null })).toBeUndefined();
  });

  it('should tell that a grant reaches beyond the role of its recipient', () => {
    expect(getNote({ canRead: false })).toBe(
      "Gets this record only: their role can't access Opportunities",
    );
  });

  it('should say nothing when the role can already access the object', () => {
    expect(getNote({ canRead: true })).toBeUndefined();
  });
});
