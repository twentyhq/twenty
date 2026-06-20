import { describe, expect, it } from 'vitest';

import ambassadorManagerRole from './ambassador-manager.role';
import ambassadorRepRole from './ambassador-rep.role';
import {
  AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATE_GROUPS,
  AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATES,
  AMBASSADOR_OBJECT_PERMISSIONS,
  AMBASSADOR_OWNERSHIP_FIELD_PERMISSIONS,
  AMBASSADOR_REP_ROW_LEVEL_PERMISSION_PREDICATES,
} from './ambassador-row-permissions';

// Local type to access row-level permission fields twenty-sdk/define does not export.
type RoleResultWithRowLevel = {
  success: boolean;
  config?: {
    canReadAllObjectRecords: boolean;
    canUpdateAllObjectRecords: boolean;
    objectPermissions: unknown[];
    fieldPermissions: unknown[];
    rowLevelPermissionPredicates?: unknown[];
    rowLevelPermissionPredicateGroups?: unknown[];
  };
};

const repRole = ambassadorRepRole as unknown as RoleResultWithRowLevel;
const managerRole = ambassadorManagerRole as unknown as RoleResultWithRowLevel;

describe('ambassador row permissions', () => {
  it('keeps ambassador rep visibility scoped to owned records', () => {
    expect(repRole.success).toBe(true);
    expect(repRole.config?.canReadAllObjectRecords).toBe(false);
    expect(repRole.config?.canUpdateAllObjectRecords).toBe(false);
    expect(repRole.config?.objectPermissions).toEqual(
      AMBASSADOR_OBJECT_PERMISSIONS,
    );
    expect(repRole.config?.fieldPermissions).toEqual(
      AMBASSADOR_OWNERSHIP_FIELD_PERMISSIONS,
    );
    expect(repRole.config?.rowLevelPermissionPredicates).toEqual(
      AMBASSADOR_REP_ROW_LEVEL_PERMISSION_PREDICATES,
    );
    expect(repRole.config?.rowLevelPermissionPredicates).toHaveLength(
      AMBASSADOR_OBJECT_PERMISSIONS.length,
    );
    expect(AMBASSADOR_OBJECT_PERMISSIONS).toEqual(
      expect.arrayContaining(
        AMBASSADOR_OBJECT_PERMISSIONS.map((permission) =>
          expect.objectContaining({
            objectUniversalIdentifier: permission.objectUniversalIdentifier,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          }),
        ),
      ),
    );
    expect(AMBASSADOR_OWNERSHIP_FIELD_PERMISSIONS).toEqual(
      expect.arrayContaining(
        AMBASSADOR_OWNERSHIP_FIELD_PERMISSIONS.map((permission) =>
          expect.objectContaining({
            fieldUniversalIdentifier: permission.fieldUniversalIdentifier,
            canReadFieldValue: true,
            canUpdateFieldValue: false,
          }),
        ),
      ),
    );
  });

  it('grants ambassador managers OR visibility across rep and supervisor fields', () => {
    expect(managerRole.success).toBe(true);
    expect(managerRole.config?.canReadAllObjectRecords).toBe(false);
    expect(managerRole.config?.canUpdateAllObjectRecords).toBe(false);
    expect(managerRole.config?.objectPermissions).toEqual(
      AMBASSADOR_OBJECT_PERMISSIONS,
    );
    expect(managerRole.config?.fieldPermissions).toEqual(
      AMBASSADOR_OWNERSHIP_FIELD_PERMISSIONS,
    );
    expect(
      managerRole.config?.rowLevelPermissionPredicateGroups,
    ).toEqual(AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATE_GROUPS);
    expect(managerRole.config?.rowLevelPermissionPredicates).toEqual(
      AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATES,
    );
    expect(
      managerRole.config?.rowLevelPermissionPredicates,
    ).toHaveLength(AMBASSADOR_OBJECT_PERMISSIONS.length * 2);
    expect(AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATE_GROUPS).toEqual(
      expect.arrayContaining(
        AMBASSADOR_OBJECT_PERMISSIONS.map((permission) =>
          expect.objectContaining({
            objectUniversalIdentifier: permission.objectUniversalIdentifier,
            logicalOperator: 'OR',
          }),
        ),
      ),
    );

    for (const predicateGroup of AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATE_GROUPS) {
      expect(
        AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATES.filter(
          (predicate) =>
            predicate.rowLevelPermissionPredicateGroupUniversalIdentifier ===
            predicateGroup.universalIdentifier,
        ).map(
          (predicate) => predicate.positionInRowLevelPermissionPredicateGroup,
        ),
      ).toEqual([0, 1]);
    }
  });
});
