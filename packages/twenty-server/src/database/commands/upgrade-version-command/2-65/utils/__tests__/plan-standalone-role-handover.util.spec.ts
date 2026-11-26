import {
  buildRequestedRoleFixture,
  WORKSPACE_CUSTOM_APPLICATION,
} from 'src/database/commands/upgrade-version-command/2-65/utils/__tests__/marketplace-application-role.fixtures';
import {
  getHandedOverRoleUniversalIdentifier,
  planStandaloneRoleHandover,
} from 'src/database/commands/upgrade-version-command/2-65/utils/plan-standalone-role-handover.util';

const planHandover = () => {
  const { requestedFlatRole, flatEntityMaps } = buildRequestedRoleFixture();

  return planStandaloneRoleHandover({
    flatRole: requestedFlatRole,
    workspaceCustomApplicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
    flatEntityMaps,
  });
};

describe('planStandaloneRoleHandover', () => {
  it('rewrites the role and every permission row in place, keeping their ids', () => {
    const { rows } = planHandover();

    expect(rows.map(({ tableName, id }) => [tableName, id])).toEqual([
      ['role', 'requested-role-id'],
      ['objectPermission', 'object-permission-id'],
      ['fieldPermission', 'field-permission-id'],
      ['fieldPermission', 'rule-field-permission-id'],
      ['rolePermissionFlag', 'role-permission-flag-id'],
      ['rowLevelPermissionRule', 'rule-id'],
      ['rowLevelPermissionRule', 'person-rule-id'],
      ['rowLevelPermissionPredicateGroup', 'group-id'],
      ['rowLevelPermissionPredicate', 'predicate-id'],
    ]);
  });

  it('gives the role and its rows new universal identifiers, the same on every run', () => {
    const { rows } = planHandover();

    expect(rows[0].universalIdentifier).toBe(
      getHandedOverRoleUniversalIdentifier({
        originalRoleUniversalIdentifier: 'requested-role',
        workspaceCustomApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION,
      }),
    );
    expect(
      rows.map(({ universalIdentifier }) => universalIdentifier),
    ).not.toContain('rule');
    expect(
      new Set(rows.map(({ universalIdentifier }) => universalIdentifier)).size,
    ).toBe(rows.length);
    expect(planHandover().rows).toEqual(rows);
  });
});
