/* @license Enterprise */

import { MetadataReadability, ObjectSharingReach } from 'twenty-shared/types';

import { isRecordGrantBeyondRoleAllowed } from 'src/engine/core-modules/record-share/utils/is-record-grant-beyond-role-allowed.util';

const OPEN_OBJECT = {
  readability: MetadataReadability.OPEN,
  isSystem: false,
  sharingReach: ObjectSharingReach.WORKSPACE,
};

describe('isRecordGrantBeyondRoleAllowed', () => {
  it.each(['select', 'update'] as const)(
    'should let a grant reach beyond the role to %s',
    (operationType) => {
      expect(
        isRecordGrantBeyondRoleAllowed({
          flatObjectMetadata: OPEN_OBJECT,
          operationType,
          isRecordSharingEnabled: true,
        }),
      ).toBe(true);
    },
  );

  it.each(['insert', 'delete', 'soft-delete', 'restore'] as const)(
    'should keep %s with the role',
    (operationType) => {
      expect(
        isRecordGrantBeyondRoleAllowed({
          flatObjectMetadata: OPEN_OBJECT,
          operationType,
          isRecordSharingEnabled: true,
        }),
      ).toBe(false);
    },
  );

  it('should stay within the role when the object limits sharing to it', () => {
    expect(
      isRecordGrantBeyondRoleAllowed({
        flatObjectMetadata: {
          ...OPEN_OBJECT,
          sharingReach: ObjectSharingReach.ROLE_ACCESS,
        },
        operationType: 'select',
        isRecordSharingEnabled: true,
      }),
    ).toBe(false);
  });

  it('should stay within the role while record sharing is disabled', () => {
    expect(
      isRecordGrantBeyondRoleAllowed({
        flatObjectMetadata: OPEN_OBJECT,
        operationType: 'select',
        isRecordSharingEnabled: false,
      }),
    ).toBe(false);
  });

  it.each([
    { readability: MetadataReadability.SYSTEM, isSystem: false },
    { readability: MetadataReadability.APPLICATION, isSystem: false },
    { readability: MetadataReadability.OPEN, isSystem: true },
  ])(
    'should never reach an object whose records cannot be shared (%o)',
    (object) => {
      expect(
        isRecordGrantBeyondRoleAllowed({
          flatObjectMetadata: { ...OPEN_OBJECT, ...object },
          operationType: 'select',
          isRecordSharingEnabled: true,
        }),
      ).toBe(false);
    },
  );

  it('should reach a private object', () => {
    expect(
      isRecordGrantBeyondRoleAllowed({
        flatObjectMetadata: {
          ...OPEN_OBJECT,
          readability: MetadataReadability.PRIVATE,
        },
        operationType: 'update',
        isRecordSharingEnabled: true,
      }),
    ).toBe(true);
  });
});
