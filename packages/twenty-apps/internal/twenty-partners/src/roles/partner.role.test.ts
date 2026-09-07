import { describe, expect, it } from 'vitest';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/modules/application/objects/application.object';
import { OPPORTUNITY_APPLICANT_PARTNER_USER_IDS_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-applicant-partner-user-ids.field';
import { OPPORTUNITY_IS_LISTED_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-is-listed.field';

import partnerRole, { OPPORTUNITY_RLS_OR_GROUP_ID } from './partner.role';

const WORKSPACE_MEMBER_ID_FIELD =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.fields.id
    .universalIdentifier;
const OPPORTUNITY_OBJECT =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier;

const predicates = partnerRole.config.rowLevelPermissionPredicates ?? [];
const groups = partnerRole.config.rowLevelPermissionPredicateGroups ?? [];

const opportunityPredicates = predicates.filter(
  (predicate) => predicate.objectUniversalIdentifier === OPPORTUNITY_OBJECT,
);

describe('partner.role row-level predicates', () => {
  it('is a valid role definition', () => {
    expect(partnerRole.errors).toEqual([]);
    expect(partnerRole.success).toBe(true);
  });

  // Every object the partner can read must be row-scoped. A missing entry here silently
  // widens the role to the whole workspace, so assert the exact set.
  it('row-scopes every object the partner can read', () => {
    const scopedObjects = predicates.map(
      (predicate) => predicate.objectUniversalIdentifier,
    );

    expect(new Set(scopedObjects)).toEqual(
      new Set([
        PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
        PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
        PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
        PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
        APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
        OPPORTUNITY_OBJECT,
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember
          .universalIdentifier,
      ]),
    );
  });

  it('gives every object outside the opportunity group a single owner check', () => {
    const ownershipPredicates = predicates.filter(
      (predicate) => predicate.objectUniversalIdentifier !== OPPORTUNITY_OBJECT,
    );

    expect(ownershipPredicates).toHaveLength(8);

    for (const predicate of ownershipPredicates) {
      // RELATION filters reject CONTAINS at query time, so ownership must use IS.
      expect(predicate.operand).toBe(RowLevelPermissionPredicateOperand.IS);
      expect(predicate.workspaceMemberFieldUniversalIdentifier).toBe(
        WORKSPACE_MEMBER_ID_FIELD,
      );
      expect(predicate.predicateGroupUniversalIdentifier).toBeUndefined();
    }
  });

  it('ORs the three opportunity predicates in one group', () => {
    expect(groups).toHaveLength(1);
    expect(groups[0].universalIdentifier).toBe(OPPORTUNITY_RLS_OR_GROUP_ID);
    expect(OPPORTUNITY_RLS_OR_GROUP_ID).toBe(
      '7a7fd85d-62c6-4cac-876f-3a67951e7b10',
    );
    expect(groups[0].logicalOperator).toBe(
      RowLevelPermissionPredicateGroupLogicalOperator.OR,
    );

    expect(opportunityPredicates).toHaveLength(3);

    for (const predicate of opportunityPredicates) {
      expect(predicate.predicateGroupUniversalIdentifier).toBe(
        groups[0].universalIdentifier,
      );
    }

    expect(
      opportunityPredicates.map((predicate) => predicate.position),
    ).toEqual([0, 1, 2]);
  });

  it('keeps a listed brief visible without naming a member', () => {
    const isListed = opportunityPredicates.find(
      (predicate) =>
        predicate.fieldUniversalIdentifier === OPPORTUNITY_IS_LISTED_FIELD_ID,
    );

    expect(isListed?.value).toBe(true);
    expect(isListed?.workspaceMemberFieldUniversalIdentifier).toBeUndefined();
  });

  it('matches an applicant against the array with CONTAINS', () => {
    const applicant = opportunityPredicates.find(
      (predicate) =>
        predicate.fieldUniversalIdentifier ===
        OPPORTUNITY_APPLICANT_PARTNER_USER_IDS_FIELD_ID,
    );

    expect(applicant?.operand).toBe(
      RowLevelPermissionPredicateOperand.CONTAINS,
    );
    expect(applicant?.workspaceMemberFieldUniversalIdentifier).toBe(
      WORKSPACE_MEMBER_ID_FIELD,
    );
  });

  it('hides applicantPartnerUserIds so one applicant cannot read the others', () => {
    const fieldPermission = partnerRole.config.fieldPermissions?.find(
      (permission) =>
        permission.fieldUniversalIdentifier ===
        OPPORTUNITY_APPLICANT_PARTNER_USER_IDS_FIELD_ID,
    );

    expect(fieldPermission?.canReadFieldValue).toBe(false);
    expect(fieldPermission?.canUpdateFieldValue).toBe(false);
  });

  it('keeps predicate identifiers unique and stable so sync updates in place', () => {
    const identifiers = [
      ...predicates.map((predicate) => predicate.universalIdentifier),
      ...groups.map((group) => group.universalIdentifier),
    ];

    expect(new Set(identifiers).size).toBe(identifiers.length);
  });
});
