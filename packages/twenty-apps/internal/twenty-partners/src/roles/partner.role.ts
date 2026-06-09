import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineRole } from 'twenty-sdk/define';

import {
  INTRO_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { PARTNER_ON_OPPORTUNITY_FIELD_ID } from 'src/fields/partner-on-opportunity.field';
import { PARTNER_USER_ON_OPPORTUNITY_FIELD_ID } from 'src/fields/partner-user-on-opportunity.field';

// External partner self-service role. Scoped to the records owned by the assigned
// workspace member via row-level predicates configured out-of-band (the app manifest
// cannot ship RLS predicates). Run `yarn rls:configure` after install/reinstall.
//
// Opportunity field-level restrictions: the Partner role may READ all Opportunity
// fields but may only UPDATE the `stage` field. Every other non-system field is
// declared with canUpdateFieldValue: false below. These are deployed via manifest
// sync (yarn twenty dev --once) — the upsertFieldPermissions metadata mutation
// enforces an application-ownership check that prevents setting them post-deploy
// via workspace API key. `yarn rls:configure` queries and verifies these instead.
export default defineRole({
  universalIdentifier: PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Partner',
  description:
    'External partner self-service role. Sees and edits only its own Partner/Person/Company/Opportunity records via row-level permissions. Configure predicates with `yarn rls:configure` after install.',
  icon: 'IconBuildingStore',
  canBeAssignedToUsers: true,
  canUpdateAllSettings: false,
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  // Opportunity field permissions: read-all / update-stage-only.
  // System fields (id, createdAt, updatedAt, deletedAt) are intentionally
  // omitted — they cannot be restricted here. All other non-stage fields are
  // locked to canUpdateFieldValue: false.
  fieldPermissions: [
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.name
          .universalIdentifier,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.amount
          .universalIdentifier,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.closeDate
          .universalIdentifier,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.position
          .universalIdentifier,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.createdBy
          .universalIdentifier,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.updatedBy
          .universalIdentifier,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.pointOfContact
          .universalIdentifier,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.company
          .universalIdentifier,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.owner
          .universalIdentifier,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.taskTargets
          .universalIdentifier,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.noteTargets
          .universalIdentifier,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.attachments
          .universalIdentifier,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields
          .timelineActivities.universalIdentifier,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.searchVector
          .universalIdentifier,
      canUpdateFieldValue: false,
    },
    // App-specific Opportunity fields (added by this app, also read-only for Partner).
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: PARTNER_ON_OPPORTUNITY_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: PARTNER_USER_ON_OPPORTUNITY_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: INTRO_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: '1bc57f52-a621-4243-ae3e-05c3f504b90c', // useCase
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: '2e3e1d04-2719-4e0d-9a6b-ec73acf896c5', // tftOpportunityId
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: '37e5428c-6c8c-4616-b626-f0ea1caa443d', // designDocUrl
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: '59d5de53-202f-4913-a417-8a08970d87cc', // subscriptionFrequency
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: '7ac7517f-bbca-4b4c-8996-6f864f71219b', // hostingType
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: '834e233d-b171-409e-825f-77ac49b0f19d', // lostReason
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: '90c683ec-2365-4533-a187-7b9ae162b753', // numberOfSeats
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: 'a58214e9-38f9-4faf-8927-09b3980fd8c3', // subscriptionType
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: 'cc6b8a59-f860-493f-8b9a-f138c078fbf1', // designDocStatus
      canUpdateFieldValue: false,
    },
  ],
  objectPermissions: [
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      // Read-only on workspace members so the partner UI can resolve member-typed
      // relations (their own partnerUser link; owner/createdBy on their records).
      // Scoped to the partner's OWN member record by an RLS predicate
      // (see scripts/configure-partner-rls.ts) so the internal team roster stays hidden.
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
});
