import {
  buildRequestedRoleFixture,
  NOW,
  WORKSPACE_CUSTOM_APPLICATION,
} from 'src/database/commands/upgrade-version-command/2-66/utils/__tests__/marketplace-application-role.fixtures';
import {
  buildMarketplaceApplicationRoleClone,
  computeMarketplaceApplicationRoleCloneLabel,
  getMarketplaceApplicationRoleCloneUniversalIdentifier,
} from 'src/database/commands/upgrade-version-command/2-66/utils/build-marketplace-application-role-clone.util';

const ASSIGNABILITY = {
  canBeAssignedToUsers: true,
  canBeAssignedToApiKeys: true,
  canBeAssignedToAgents: true,
};

const buildClone = () => {
  const { requestedFlatRole, flatEntityMaps } = buildRequestedRoleFixture();

  return buildMarketplaceApplicationRoleClone({
    originalFlatRole: requestedFlatRole,
    cloneRoleId: 'clone-role-id',
    label: 'Requested role copy',
    assignability: ASSIGNABILITY,
    workspaceCustomApplicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
    flatEntityMaps,
    now: NOW,
  });
};

const CLONE_ROLE_UNIVERSAL_IDENTIFIER =
  getMarketplaceApplicationRoleCloneUniversalIdentifier({
    originalRoleUniversalIdentifier: 'requested-role',
    workspaceCustomApplicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
  });

describe('buildMarketplaceApplicationRoleClone', () => {
  it('copies the role into the workspace custom application, with the given label and assignability', () => {
    const { role } = buildClone();

    expect(role).toMatchObject({
      id: 'clone-role-id',
      universalIdentifier: CLONE_ROLE_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
      label: 'Requested role copy',
      canReadAllObjectRecords: true,
      canBeAssignedToApplications: false,
      ...ASSIGNABILITY,
      objectPermissionUniversalIdentifiers: [],
    });
    expect(role).not.toHaveProperty('applicationId');
  });

  it('copies every permission row, rules and rule-level field permissions included', () => {
    const clone = buildClone();

    expect(clone.objectPermissions).toHaveLength(1);
    expect(clone.fieldPermissions).toHaveLength(2);
    expect(clone.rolePermissionFlags).toHaveLength(1);
    expect(clone.rowLevelPermissionRules).toHaveLength(2);
    expect(clone.rowLevelPermissionPredicateGroups).toHaveLength(1);
    expect(clone.rowLevelPermissionPredicates).toHaveLength(1);

    const allRows = [
      ...clone.objectPermissions,
      ...clone.fieldPermissions,
      ...clone.rolePermissionFlags,
      ...clone.rowLevelPermissionRules,
      ...clone.rowLevelPermissionPredicateGroups,
      ...clone.rowLevelPermissionPredicates,
    ];

    for (const row of allRows) {
      expect(row).toMatchObject({
        applicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
        roleUniversalIdentifier: CLONE_ROLE_UNIVERSAL_IDENTIFIER,
      });
      expect(row).not.toHaveProperty('id');
    }
  });

  it('keeps the grants and predicates, and points the copies at each other', () => {
    const clone = buildClone();
    const [rule] = clone.rowLevelPermissionRules;
    const [group] = clone.rowLevelPermissionPredicateGroups;
    const [predicate] = clone.rowLevelPermissionPredicates;
    const ruleFieldPermission = clone.fieldPermissions.find(
      ({ canUpdateFieldValue, canReadFieldValue }) =>
        canUpdateFieldValue === false && canReadFieldValue === null,
    );

    expect(rule).toMatchObject({
      objectMetadataUniversalIdentifier: 'company',
      canReadRecords: true,
      canUpdateRecords: true,
    });
    expect(group).toMatchObject({
      logicalOperator: 'AND',
      rowLevelPermissionRuleUniversalIdentifier: rule.universalIdentifier,
      parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
    });
    expect(predicate).toMatchObject({
      operand: 'IS',
      value: 'Acme',
      fieldMetadataUniversalIdentifier: 'company-name',
      rowLevelPermissionPredicateGroupUniversalIdentifier:
        group.universalIdentifier,
      rowLevelPermissionRuleUniversalIdentifier: rule.universalIdentifier,
    });
    expect(ruleFieldPermission).toMatchObject({
      rowLevelPermissionPredicateGroupUniversalIdentifier:
        group.universalIdentifier,
      rowLevelPermissionRuleUniversalIdentifier: rule.universalIdentifier,
    });
  });

  it('derives the same universal identifiers on every run', () => {
    const universalIdentifiers = (clone: ReturnType<typeof buildClone>) =>
      [
        clone.role,
        ...clone.objectPermissions,
        ...clone.fieldPermissions,
        ...clone.rolePermissionFlags,
        ...clone.rowLevelPermissionRules,
        ...clone.rowLevelPermissionPredicateGroups,
        ...clone.rowLevelPermissionPredicates,
      ].map(({ universalIdentifier }) => universalIdentifier);

    expect(universalIdentifiers(buildClone())).toEqual(
      universalIdentifiers(buildClone()),
    );
    expect(universalIdentifiers(buildClone())).not.toContain('rule');
  });

  it('skips soft-deleted predicates and groups', () => {
    const { requestedFlatRole, flatEntityMaps } = buildRequestedRoleFixture();
    const predicate =
      flatEntityMaps.flatRowLevelPermissionPredicateMaps.byUniversalIdentifier
        .predicate;

    if (predicate === undefined) {
      throw new Error('fixture is missing its predicate');
    }

    flatEntityMaps.flatRowLevelPermissionPredicateMaps.byUniversalIdentifier.predicate =
      { ...predicate, deletedAt: NOW };

    expect(
      buildMarketplaceApplicationRoleClone({
        originalFlatRole: requestedFlatRole,
        cloneRoleId: 'clone-role-id',
        label: 'Requested role copy',
        assignability: ASSIGNABILITY,
        workspaceCustomApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION,
        flatEntityMaps,
        now: NOW,
      }).rowLevelPermissionPredicates,
    ).toEqual([]);
  });
});

describe('computeMarketplaceApplicationRoleCloneLabel', () => {
  it('suffixes the label until it is free', () => {
    expect(
      computeMarketplaceApplicationRoleCloneLabel({
        originalLabel: 'Partner',
        takenLabels: new Set(['Partner', 'Partner copy', 'Partner copy 2']),
      }),
    ).toBe('Partner copy 3');
  });
});
