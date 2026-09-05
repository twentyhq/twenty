import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-predicate-manifest-to-universal-flat-row-level-permission-predicate.util';
import { fromSharingRuleManifestToUniversalFlatSharingRule } from 'src/engine/core-modules/application/application-manifest/converters/from-sharing-rule-manifest-to-universal-flat-sharing-rule.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = '11111111-1111-4111-8111-111111111111';
const RULE_UNIVERSAL_IDENTIFIER = '22222222-2222-4222-8222-222222222222';
const OBJECT_UNIVERSAL_IDENTIFIER = '33333333-3333-4333-8333-333333333333';
const ROLE_UNIVERSAL_IDENTIFIER = '44444444-4444-4444-8444-444444444444';
const FIELD_UNIVERSAL_IDENTIFIER = '55555555-5555-4555-8555-555555555555';
const PREDICATE_UNIVERSAL_IDENTIFIER = '66666666-6666-4666-8666-666666666666';
const NOW = '2026-09-04T00:00:00.000Z';

describe('fromSharingRuleManifestToUniversalFlatSharingRule', () => {
  it('converts a rule granting everyone with no criteria', () => {
    expect(
      fromSharingRuleManifestToUniversalFlatSharingRule({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        now: NOW,
        sharingRuleManifest: {
          universalIdentifier: RULE_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          name: 'Admins see everything',
          granteePrincipalType: RecordSharePrincipalType.EVERYONE,
          accessLevel: RecordShareAccessLevel.READ,
        },
      }),
    ).toEqual({
      universalIdentifier: RULE_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      name: 'Admins see everything',
      description: null,
      granteePrincipalType: RecordSharePrincipalType.EVERYONE,
      granteeRoleUniversalIdentifier: null,
      granteePrincipalId: null,
      accessLevel: RecordShareAccessLevel.READ,
      isActive: true,
      rowLevelPermissionPredicateUniversalIdentifiers: [],
      rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
      createdAt: NOW,
      updatedAt: NOW,
      deletedAt: null,
    });
  });

  it('keeps a role grantee as a universal identifier for the sync to resolve', () => {
    expect(
      fromSharingRuleManifestToUniversalFlatSharingRule({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        now: NOW,
        sharingRuleManifest: {
          universalIdentifier: RULE_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          name: 'Sales reads deals',
          description: 'Every sales member reads every deal',
          granteePrincipalType: RecordSharePrincipalType.ROLE,
          granteeRoleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
          isActive: false,
        },
      }),
    ).toMatchObject({
      description: 'Every sales member reads every deal',
      granteePrincipalType: RecordSharePrincipalType.ROLE,
      granteeRoleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
      granteePrincipalId: null,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
      isActive: false,
    });
  });

  it('gives a predicate nested under a rule the rule as parent and no role', () => {
    expect(
      fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate(
        {
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          now: NOW,
          parent: { sharingRuleUniversalIdentifier: RULE_UNIVERSAL_IDENTIFIER },
          rowLevelPermissionPredicateManifest: {
            universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER,
            objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
            fieldUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
            operand: RowLevelPermissionPredicateOperand.IS,
            value: 'closed',
          },
        },
      ),
    ).toMatchObject({
      universalIdentifier: PREDICATE_UNIVERSAL_IDENTIFIER,
      roleUniversalIdentifier: null,
      sharingRuleUniversalIdentifier: RULE_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      operand: RowLevelPermissionPredicateOperand.IS,
      value: 'closed',
    });
  });
});
