import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  SystemPermissionFlag,
  defineRole,
} from 'twenty-sdk/define';

import {
  INTRO_SENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
  PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import {
  APPLICATION_NAME_FIELD_ID,
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_PARTNER_FIELD_ID,
  APPLICATION_PARTNER_USER_FIELD_ID,
  APPLICATION_STATE_FIELD_ID,
  APPLICATIONS_ON_OPPORTUNITY_FIELD_ID,
} from 'src/modules/application/objects/application.object';
import {
  PARTNER_CONTENT_APPROVAL_DATE_FIELD_ID,
  PARTNER_CONTENT_DOCUMENTS_FIELD_ID,
  PARTNER_CONTENT_INTERVIEW_FIELD_ID,
  PARTNER_CONTENT_STATUS_FIELD_ID,
  PARTNER_CONTENT_TYPE_FIELD_ID,
} from 'src/modules/partner/objects/partner-content.object';
import { PARTNER_CONTENT_PARTNER_FIELD_ID } from 'src/modules/partner/fields/partner-content-partner.field';
import { OPPORTUNITY_DESIGN_DOC_STATUS_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-design-doc-status.field';
import { OPPORTUNITY_DESIGN_DOC_URL_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-design-doc-url.field';
import { OPPORTUNITY_HOSTING_TYPE_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-hosting-type.field';
import { OPPORTUNITY_IS_LISTED_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-is-listed.field';
import { OPPORTUNITY_LOST_REASON_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-lost-reason.field';
import { OPPORTUNITY_NEED_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-need.field';
import { OPPORTUNITY_NUMBER_OF_SEATS_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-number-of-seats.field';
import { OPPORTUNITY_REQUIREMENTS_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-requirements.field';
import { OPPORTUNITY_SUBSCRIPTION_FREQUENCY_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-subscription-frequency.field';
import { OPPORTUNITY_SUBSCRIPTION_TYPE_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-subscription-type.field';
import { OPPORTUNITY_TFT_ID_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-tft-id.field';
import { OPPORTUNITY_USE_CASE_FIELD_ID } from 'src/modules/opportunity/fields/opportunity-use-case.field';
import { PARTNER_COMPANY_FIELD_ID } from 'src/modules/partner/fields/partner-company.field';
import { PARTNER_LINK_PARTNER_FIELD_ID } from 'src/modules/partner/fields/partner-link-partner.field';
import { PARTNER_ON_OPPORTUNITY_FIELD_ID } from 'src/modules/opportunity/fields/partner-on-opportunity.field';
import { PARTNER_SERVICE_PARTNER_FIELD_ID } from 'src/modules/partner/fields/partner-service-partner.field';
import { PARTNER_USER_ON_OPPORTUNITY_FIELD_ID } from 'src/modules/opportunity/fields/partner-user-on-opportunity.field';
import { PARTNER_USER_ON_PARTNER_CONTENT_FIELD_ID } from 'src/modules/partner/fields/partner-user-on-partner-content.field';
import { PARTNER_USER_ON_PARTNER_LINK_FIELD_ID } from 'src/modules/partner/fields/partner-user-on-partner-link.field';
import { PARTNER_USER_ON_PARTNER_FIELD_ID } from 'src/modules/partner/fields/partner-user-on-partner.field';
import { PARTNER_USER_ON_PARTNER_SERVICE_FIELD_ID } from 'src/modules/partner/fields/partner-user-on-partner-service.field';
import { REFERRED_BY_PARTNER_ON_OPPORTUNITY_FIELD_ID } from 'src/modules/opportunity/fields/referred-by-partner-on-opportunity.field';

// Shared with configure-partner-rls.ts, which locates the role by this label.
export const PARTNER_ROLE_LABEL = 'Partner';

// External partner self-service role: a partner sees only its own records and can edit its
// own Partner profile. Company, Person, Opportunity and Application are read-only — the
// pitch is set once by the apply route (application role) at creation and is never editable
// by the partner afterwards. Application rows are scoped to own partnerUser (RLS).
// Row-level predicates can't ship in the manifest, so run `yarn rls:configure` after install.
//
// The Opportunity and Application field locks below are moot now that neither object is
// writable at all. They stay because configure-partner-rls.ts asserts on them and exits
// non-zero on drift, and because they still describe intent if object access ever reopens.
//
// `updatedBy` and `position` are left unlocked on purpose: the server injects `updatedBy`
// into every update (ActorFromAuthContextService) and co-writes `position` with `stage` on a
// kanban drag, so locking either would make every opportunity update fail with
// PERMISSION_DENIED if object-level write returned. The server overwrites both regardless,
// so there's nothing to protect. `createdBy` stays locked (not injected on update);
// `searchVector` is a generated column, so its lock is an inert no-op.
export default defineRole({
  universalIdentifier: PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
  label: PARTNER_ROLE_LABEL,
  description:
    'External partner self-service role. Sees only its own Partner/Person/Company/PartnerLink/PartnerService/PartnerContent/Opportunity/Application records (row-level). Can edit its own Partner profile; Application is read-only (the pitch is set once at apply time and cannot be edited afterwards); Opportunity stage/amount are read-only. Configure predicates with `yarn rls:configure` after install.',
  icon: 'IconBuildingStore',
  canBeAssignedToUsers: true,
  canUpdateAllSettings: false,
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  // UPLOAD_FILE lets partners upload their own profile picture and case-study covers on the
  // native record page (the FilesField upload mutation is gated behind this flag).
  permissionFlagUniversalIdentifiers: [SystemPermissionFlag.UPLOAD_FILE],
  // Lock every Opportunity field except the system/server-managed fields left out here
  // (id, timestamps, updatedBy, position — see header). Stage + amount are locked too.
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
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.stage
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
      fieldUniversalIdentifier: REFERRED_BY_PARTNER_ON_OPPORTUNITY_FIELD_ID,
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
  // Marketplace brief fields — read-only for partners (listed briefs visible via RLS OR predicate).
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: OPPORTUNITY_IS_LISTED_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: APPLICATIONS_ON_OPPORTUNITY_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: OPPORTUNITY_REQUIREMENTS_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      fieldUniversalIdentifier: OPPORTUNITY_NEED_FIELD_ID,
      canUpdateFieldValue: false,
    },
    // Partner object — lock admin-managed fields so partners can't self-promote or alter ops data.
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: 'a0000002-0000-4000-8000-000000000002',
      canUpdateFieldValue: false,
    },
    {
      // Validation Stage — read-locked too: admin-only on the record page, hidden from partners.
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: '2ca9856f-f54a-4326-9ff3-668fd7da0b50',
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: '5af4e57e-7fa7-4c4f-b40f-37549361459a',
      canUpdateFieldValue: false,
    },
    {
      // Partner Tier — read-locked too: admin-only on the record page, hidden from partners.
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: 'd4fa6461-37b6-49ee-9181-dd482e74a70b',
      canReadFieldValue: false,
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
    // Partner Link object — both relation pivots are read-only for partners. Repointing either
    // would move links out of RLS scope or let a partner attach links to another profile.
    {
      objectUniversalIdentifier: PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_LINK_PARTNER_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_USER_ON_PARTNER_LINK_FIELD_ID,
      canUpdateFieldValue: false,
    },
    // Partner Service object — both relation pivots are read-only for partners. Repointing either
    // would move services out of RLS scope or let a partner attach services to another profile.
    {
      objectUniversalIdentifier: PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_SERVICE_PARTNER_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_USER_ON_PARTNER_SERVICE_FIELD_ID,
      canUpdateFieldValue: false,
    },
    // Partner Content object — the self-service save route runs with the caller's own
    // permissions, so partners self-publish their own case studies: only status is writable
    // (the route sets it to APPROVED/WIP; RLS scopes to their own rows). Ownership (partner,
    // partnerUser) and contentType stay locked and are stamped server-side by the
    // on-partner-content-created trigger, so a partner cannot repoint content to another partner.
    {
      objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_CONTENT_TYPE_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_CONTENT_APPROVAL_DATE_FIELD_ID,
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_CONTENT_INTERVIEW_FIELD_ID,
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_CONTENT_DOCUMENTS_FIELD_ID,
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_CONTENT_STATUS_FIELD_ID,
      canUpdateFieldValue: true,
    },
    {
      objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_CONTENT_PARTNER_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: PARTNER_USER_ON_PARTNER_CONTENT_FIELD_ID,
      canUpdateFieldValue: false,
    },
    // Application — lock every field except pitch and opportunity: the apply route sets
    // both once, at creation, under the application role — not the partner role, which
    // cannot write this object at all (canUpdateObjectRecords: false). state is populated
    // by on-application-created as the app. partnerUser is listed as locked but stays
    // writable at insert — the server exempts RLS predicate fields there
    // (permissions.utils.ts, insert case only).
    // System/server-managed fields (id, timestamps, updatedBy, position, searchVector) stay
    // out — locking updatedBy/position breaks every update (same trap as Opportunity above).
    {
      objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: APPLICATION_NAME_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: APPLICATION_PARTNER_USER_FIELD_ID,
      canUpdateFieldValue: false,
    },
    {
      objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: APPLICATION_STATE_FIELD_ID,
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
      // Also what hides the "New Opportunity" button: the standard command menu item is
      // gated on objectPermissions.canUpdateObjectRecords.
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
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
      objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
      // Insert permission checks canUpdateObjectRecords; disabling prevents
      // partners from creating bare Applications (created by apply-to-brief route instead).
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier: PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier: PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      // Read-only so the UI can resolve member-typed relations (own partnerUser link,
      // owner/createdBy). An RLS predicate scopes this to the partner's own member record
      // (see scripts/configure-partner-rls.ts) so the internal roster stays hidden.
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
});
