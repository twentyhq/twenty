import { describe, expect, it } from 'vitest';
import { RowLevelPermissionPredicateGroupLogicalOperator } from 'twenty-sdk/define';

import ambassadorManagerRole from './ambassador-manager.role';
import ambassadorRepRole from './ambassador-rep.role';
import {
  AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATE_GROUPS,
  AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATES,
  AMBASSADOR_OBJECT_PERMISSIONS,
  AMBASSADOR_OWNERSHIP_FIELD_PERMISSIONS,
  AMBASSADOR_REP_ROW_LEVEL_PERMISSION_PREDICATES,
} from './ambassador-row-permissions';

describe('ambassador row permissions', () => {
  it('keeps ambassador rep visibility scoped to owned records', () => {
    expect(ambassadorRepRole.success).toBe(true);
    expect(ambassadorRepRole.config?.canReadAllObjectRecords).toBe(false);
    expect(ambassadorRepRole.config?.canUpdateAllObjectRecords).toBe(false);
    expect(ambassadorRepRole.config?.objectPermissions).toEqual(
      AMBASSADOR_OBJECT_PERMISSIONS,
    );
    expect(ambassadorRepRole.config?.fieldPermissions).toEqual(
      AMBASSADOR_OWNERSHIP_FIELD_PERMISSIONS,
    );
    expect(ambassadorRepRole.config?.rowLevelPermissionPredicates).toEqual(
      AMBASSADOR_REP_ROW_LEVEL_PERMISSION_PREDICATES,
    );
    expect(ambassadorRepRole.config?.rowLevelPermissionPredicates).toHaveLength(
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
    expect(ambassadorManagerRole.success).toBe(true);
    expect(ambassadorManagerRole.config?.canReadAllObjectRecords).toBe(false);
    expect(ambassadorManagerRole.config?.canUpdateAllObjectRecords).toBe(false);
    expect(ambassadorManagerRole.config?.objectPermissions).toEqual(
      AMBASSADOR_OBJECT_PERMISSIONS,
    );
    expect(ambassadorManagerRole.config?.fieldPermissions).toEqual(
      AMBASSADOR_OWNERSHIP_FIELD_PERMISSIONS,
    );
    expect(
      ambassadorManagerRole.config?.rowLevelPermissionPredicateGroups,
    ).toEqual(AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATE_GROUPS);
    expect(ambassadorManagerRole.config?.rowLevelPermissionPredicates).toEqual(
      AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATES,
    );
    expect(
      ambassadorManagerRole.config?.rowLevelPermissionPredicates,
    ).toHaveLength(AMBASSADOR_OBJECT_PERMISSIONS.length * 2);
    expect(AMBASSADOR_MANAGER_ROW_LEVEL_PERMISSION_PREDICATE_GROUPS).toEqual(
      expect.arrayContaining(
        AMBASSADOR_OBJECT_PERMISSIONS.map((permission) =>
          expect.objectContaining({
            objectUniversalIdentifier: permission.objectUniversalIdentifier,
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
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
