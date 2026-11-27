import { getObjectPermissionUniversalIdentifier } from 'twenty-shared/application';

import {
  APPLICATION,
  buildRequestedRoleFixture,
  NOW,
} from 'src/database/commands/upgrade-version-command/2-66/utils/__tests__/marketplace-application-role.fixtures';
import { buildMarketplaceApplicationRoleCleanup } from 'src/database/commands/upgrade-version-command/2-66/utils/build-marketplace-application-role-cleanup.util';

const universalIdentifiersOf = (rows: { universalIdentifier: string }[]) =>
  rows.map(({ universalIdentifier }) => universalIdentifier).sort();

describe('buildMarketplaceApplicationRoleCleanup', () => {
  it('moves what the rules grant onto the object permissions', () => {
    const { requestedFlatRole, flatEntityMaps } = buildRequestedRoleFixture();

    const cleanup = buildMarketplaceApplicationRoleCleanup({
      originalFlatRole: requestedFlatRole,
      flatEntityMaps,
      now: NOW,
    });

    expect(cleanup.objectPermissionsToUpdate).toEqual([
      expect.objectContaining({
        universalIdentifier: 'object-permission',
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canCreateObjectRecords: null,
        canSoftDeleteObjectRecords: null,
        canDestroyObjectRecords: null,
      }),
    ]);
    expect(cleanup.objectPermissionsToCreate).toEqual([
      expect.objectContaining({
        universalIdentifier: getObjectPermissionUniversalIdentifier({
          applicationUniversalIdentifier: APPLICATION,
          roleUniversalIdentifier: 'requested-role',
          objectUniversalIdentifier: 'person',
        }),
        applicationUniversalIdentifier: APPLICATION,
        roleUniversalIdentifier: 'requested-role',
        objectMetadataUniversalIdentifier: 'person',
        canReadObjectRecords: true,
        canUpdateObjectRecords: null,
      }),
    ]);
  });

  it('drops the rules, predicates, groups and field permissions', () => {
    const { requestedFlatRole, flatEntityMaps } = buildRequestedRoleFixture();

    const cleanup = buildMarketplaceApplicationRoleCleanup({
      originalFlatRole: requestedFlatRole,
      flatEntityMaps,
      now: NOW,
    });

    expect(
      universalIdentifiersOf(cleanup.rowLevelPermissionRulesToDelete),
    ).toEqual(['person-rule', 'rule']);
    expect(
      universalIdentifiersOf(cleanup.rowLevelPermissionPredicateGroupsToDelete),
    ).toEqual(['group']);
    expect(
      universalIdentifiersOf(cleanup.rowLevelPermissionPredicatesToDelete),
    ).toEqual(['predicate']);
    expect(universalIdentifiersOf(cleanup.fieldPermissionsToDelete)).toEqual([
      'field-permission',
      'rule-field-permission',
    ]);
  });

  it('turns users and API keys off, and keeps agents', () => {
    const { requestedFlatRole, flatEntityMaps } = buildRequestedRoleFixture();

    expect(
      buildMarketplaceApplicationRoleCleanup({
        originalFlatRole: requestedFlatRole,
        flatEntityMaps,
        now: NOW,
      }).roleToUpdate,
    ).toMatchObject({
      universalIdentifier: 'requested-role',
      canBeAssignedToUsers: false,
      canBeAssignedToApiKeys: false,
      canBeAssignedToAgents: true,
    });
  });

  it('has nothing to do on a clean agent-only role', () => {
    const { requestedFlatRole, flatEntityMaps } = buildRequestedRoleFixture();

    const cleanup = buildMarketplaceApplicationRoleCleanup({
      originalFlatRole: {
        ...requestedFlatRole,
        canBeAssignedToUsers: false,
        canBeAssignedToApiKeys: false,
        fieldPermissionUniversalIdentifiers: [],
        rowLevelPermissionRuleUniversalIdentifiers: [],
        rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
        rowLevelPermissionPredicateUniversalIdentifiers: [],
      },
      flatEntityMaps,
      now: NOW,
    });

    expect(cleanup).toEqual({
      roleToUpdate: undefined,
      objectPermissionsToCreate: [],
      objectPermissionsToUpdate: [],
      fieldPermissionsToDelete: [],
      rowLevelPermissionRulesToDelete: [],
      rowLevelPermissionPredicateGroupsToDelete: [],
      rowLevelPermissionPredicatesToDelete: [],
    });
  });
});
