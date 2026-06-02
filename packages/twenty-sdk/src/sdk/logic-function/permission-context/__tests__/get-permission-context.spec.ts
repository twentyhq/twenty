import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  FieldPermissionLevel,
  type LogicFunctionPermissionContext,
  ObjectPermissionLevel,
} from 'twenty-shared/application';

import { getPermissionContext } from '@/sdk/logic-function/permission-context/get-permission-context';

const OBJECT_UID = 'object-uid';
const READONLY_OBJECT_UID = 'readonly-object-uid';
const FIELD_UID = 'field-uid';
const FLAG_UID = 'flag-uid';

const CONTEXT: LogicFunctionPermissionContext = {
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canAccessAllTools: true,
  permissionFlags: {
    [FLAG_UID]: true,
    'denied-flag-uid': false,
  },
  objectsPermissions: {
    [OBJECT_UID]: {
      canRead: true,
      canUpdate: true,
      canSoftDelete: false,
      canDestroy: false,
      restrictedFields: {
        [FIELD_UID]: { canRead: false, canUpdate: null },
      },
    },
    [READONLY_OBJECT_UID]: {
      canRead: true,
      canUpdate: false,
      canSoftDelete: false,
      canDestroy: false,
      restrictedFields: {},
    },
  },
};

describe('getPermissionContext', () => {
  afterEach(() => {
    delete process.env.TWENTY_PERMISSION_CONTEXT;
  });

  describe('with an injected context', () => {
    beforeEach(() => {
      process.env.TWENTY_PERMISSION_CONTEXT = JSON.stringify(CONTEXT);
    });

    it('exposes the root capability booleans', () => {
      const permissions = getPermissionContext();

      expect(permissions.canReadAllObjectRecords).toBe(true);
      expect(permissions.canUpdateAllObjectRecords).toBe(false);
      expect(permissions.canAccessAllTools).toBe(true);
      expect(permissions.canUpdateAllSettings).toBe(false);
    });

    it('resolves object permissions per level', () => {
      const permissions = getPermissionContext();

      expect(
        permissions.hasObjectPermission(OBJECT_UID, ObjectPermissionLevel.READ),
      ).toBe(true);
      expect(
        permissions.hasObjectPermission(
          OBJECT_UID,
          ObjectPermissionLevel.UPDATE,
        ),
      ).toBe(true);
      expect(
        permissions.hasObjectPermission(
          OBJECT_UID,
          ObjectPermissionLevel.SOFT_DELETE,
        ),
      ).toBe(false);
      expect(
        permissions.hasObjectPermission(
          OBJECT_UID,
          ObjectPermissionLevel.DESTROY,
        ),
      ).toBe(false);
    });

    it('returns false for an unknown object', () => {
      const permissions = getPermissionContext();

      expect(
        permissions.hasObjectPermission('unknown', ObjectPermissionLevel.READ),
      ).toBe(false);
    });

    it('blocks a field whose read is explicitly restricted', () => {
      const permissions = getPermissionContext();

      expect(
        permissions.hasFieldPermission(
          OBJECT_UID,
          FIELD_UID,
          FieldPermissionLevel.READ,
        ),
      ).toBe(false);
    });

    it('allows a restricted field when the level is not explicitly false', () => {
      const permissions = getPermissionContext();

      // restrictedFields[FIELD_UID].canUpdate is null, not false
      expect(
        permissions.hasFieldPermission(
          OBJECT_UID,
          FIELD_UID,
          FieldPermissionLevel.UPDATE,
        ),
      ).toBe(true);
    });

    it('allows an unrestricted field when the object permits it', () => {
      const permissions = getPermissionContext();

      expect(
        permissions.hasFieldPermission(
          OBJECT_UID,
          'unrestricted-field',
          FieldPermissionLevel.READ,
        ),
      ).toBe(true);
    });

    it('gates field permission on the matching object permission', () => {
      const permissions = getPermissionContext();

      expect(
        permissions.hasFieldPermission(
          READONLY_OBJECT_UID,
          'any-field',
          FieldPermissionLevel.READ,
        ),
      ).toBe(true);
      expect(
        permissions.hasFieldPermission(
          READONLY_OBJECT_UID,
          'any-field',
          FieldPermissionLevel.UPDATE,
        ),
      ).toBe(false);
    });

    it('resolves permission flags by universal identifier', () => {
      const permissions = getPermissionContext();

      expect(permissions.hasPermissionFlag(FLAG_UID)).toBe(true);
      expect(permissions.hasPermissionFlag('denied-flag-uid')).toBe(false);
      expect(permissions.hasPermissionFlag('missing-flag-uid')).toBe(false);
    });
  });

  describe('without an injected context', () => {
    it('falls back to an empty default when the env var is absent', () => {
      const permissions = getPermissionContext();

      expect(permissions.canReadAllObjectRecords).toBe(false);
      expect(permissions.canAccessAllTools).toBe(false);
      expect(permissions.objectsPermissions).toEqual({});
      expect(permissions.permissionFlags).toEqual({});
      expect(
        permissions.hasObjectPermission(OBJECT_UID, ObjectPermissionLevel.READ),
      ).toBe(false);
      expect(permissions.hasPermissionFlag(FLAG_UID)).toBe(false);
    });

    it('falls back to an empty default when the env var is malformed', () => {
      process.env.TWENTY_PERMISSION_CONTEXT = '{ not json';

      const permissions = getPermissionContext();

      expect(permissions.canReadAllObjectRecords).toBe(false);
      expect(permissions.objectsPermissions).toEqual({});
    });
  });
});
