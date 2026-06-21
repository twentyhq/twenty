import {
  RowLevelPermissionPredicateOperand,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineRole,
} from 'twenty-sdk/define';

import {
  INTRO_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { OPPORTUNITY_DESIGN_DOC_STATUS_FIELD_ID } from 'src/fields/opportunity-design-doc-status.field';
import { OPPORTUNITY_DESIGN_DOC_URL_FIELD_ID } from 'src/fields/opportunity-design-doc-url.field';
import { OPPORTUNITY_HOSTING_TYPE_FIELD_ID } from 'src/fields/opportunity-hosting-type.field';
import { OPPORTUNITY_LOST_REASON_FIELD_ID } from 'src/fields/opportunity-lost-reason.field';
import { OPPORTUNITY_NUMBER_OF_SEATS_FIELD_ID } from 'src/fields/opportunity-number-of-seats.field';
import { OPPORTUNITY_SUBSCRIPTION_FREQUENCY_FIELD_ID } from 'src/fields/opportunity-subscription-frequency.field';
import { OPPORTUNITY_SUBSCRIPTION_TYPE_FIELD_ID } from 'src/fields/opportunity-subscription-type.field';
import { OPPORTUNITY_TFT_ID_FIELD_ID } from 'src/fields/opportunity-tft-id.field';
import { OPPORTUNITY_USE_CASE_FIELD_ID } from 'src/fields/opportunity-use-case.field';
import { PARTNER_COMPANY_FIELD_ID } from 'src/fields/partner-company.field';
import { PARTNER_ON_OPPORTUNITY_FIELD_ID } from 'src/fields/partner-on-opportunity.field';
import { PARTNER_USER_ON_COMPANY_FIELD_ID } from 'src/fields/partner-user-on-company.field';
import { PARTNER_USER_ON_OPPORTUNITY_FIELD_ID } from 'src/fields/partner-user-on-opportunity.field';
import { PARTNER_USER_ON_PARTNER_FIELD_ID } from 'src/fields/partner-user-on-partner.field';
import { PARTNER_USER_ON_PERSON_FIELD_ID } from 'src/fields/partner-user-on-person.field';

// `updatedBy` and `position` must stay editable even though they're not partner-facing: the
// server injects `updatedBy` into every update (ActorFromAuthContextService) and co-writes
// `position` with `stage` on a kanban drag, so locking either makes ALL opportunity updates
// fail with PERMISSION_DENIED. `createdBy` stays locked (not injected on update); `searchVector`
// is a generated column, so its lock is an inert no-op.
export default defineRole({
  universalIdentifier: PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Partner',
  description:
    'External partner self-service role. Sees only its own Partner/Person/Company/Opportunity records (row-level). Can edit its own Partner profile and an Opportunity’s stage + amount; Company and Person are read-only.',
  icon: 'IconBuildingStore',
  canBeAssignedToUsers: true,
  canUpdateAllSettings: false,
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  // Lock every Opportunity field except stage/amount (editable) and the system/
  // server-managed fields left out here (id, timestamps, updatedBy, position — see header).
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
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.closeDate
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
      fieldUniversalIdentifier: OPPORTUNITY_USE_CASE_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: OPPORTUNITY_TFT_ID_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: OPPORTUNITY_DESIGN_DOC_URL_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: OPPORTUNITY_SUBSCRIPTION_FREQUENCY_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: OPPORTUNITY_HOSTING_TYPE_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: OPPORTUNITY_LOST_REASON_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: OPPORTUNITY_NUMBER_OF_SEATS_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: OPPORTUNITY_SUBSCRIPTION_TYPE_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: OPPORTUNITY_DESIGN_DOC_STATUS_FIELD_ID,
      canUpdateFieldValue: false,
    },
    // Partner object — lock admin-managed fields so partners can't self-promote or alter ops data.
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: 'a0000002-0000-4000-8000-000000000002',
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: '2ca9856f-f54a-4326-9ff3-668fd7da0b50',
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: '5af4e57e-7fa7-4c4f-b40f-37549361459a',
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: '5412e4ca-cc96-4be8-8652-b73dace7673b',
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: 'd4fa6461-37b6-49ee-9181-dd482e74a70b',
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: 'a0000011-0000-4000-8000-000000000011',
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: 'a0000010-0000-4000-8000-000000000010',
      canUpdateFieldValue: false,
    },
    // Relation locks — the FK relations the Partner record itself owns. partnerUser is the
    // RLS pivot: clearing or repointing it would drop the partner's own record out of scope
    // (an orphan only admins can see). company is read-only as an object, so its link must
    // not be repointable either. Mirrors the Opportunity partner/partnerUser locks above.
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_USER_ON_PARTNER_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_COMPANY_FIELD_ID,
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
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  rowLevelPermissionPredicates: [
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_USER_ON_PARTNER_FIELD_ID,
      operand: RowLevelPermissionPredicateOperand.IS,
      workspaceMemberFieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.fields.id
          .universalIdentifier,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
      fieldUniversalIdentifier: PARTNER_USER_ON_PERSON_FIELD_ID,
      operand: RowLevelPermissionPredicateOperand.IS,
      workspaceMemberFieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.fields.id
          .universalIdentifier,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
      fieldUniversalIdentifier: PARTNER_USER_ON_COMPANY_FIELD_ID,
      operand: RowLevelPermissionPredicateOperand.IS,
      workspaceMemberFieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.fields.id
          .universalIdentifier,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: PARTNER_USER_ON_OPPORTUNITY_FIELD_ID,
      operand: RowLevelPermissionPredicateOperand.IS,
      workspaceMemberFieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.fields.id
          .universalIdentifier,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
      fieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.fields.id
          .universalIdentifier,
      operand: RowLevelPermissionPredicateOperand.IS,
      workspaceMemberFieldUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.fields.id
          .universalIdentifier,
    },
  ],
});
