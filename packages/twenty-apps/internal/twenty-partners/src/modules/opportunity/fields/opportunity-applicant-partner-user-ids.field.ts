import {
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

export const OPPORTUNITY_APPLICANT_PARTNER_USER_IDS_FIELD_ID =
  '223ec774-6cd6-4c19-8f32-308faa6b80b1';

// RLS cannot join Opportunity → Application, so applicant member ids live on the
// opportunity. After unlist, (partnerUser IS me) OR (isListed) is not enough.
// The list is append-only and stamped from the Application create event: deleting an
// application does not revoke, and an opportunity linked after creation is not granted.
export default defineField({
  universalIdentifier: OPPORTUNITY_APPLICANT_PARTNER_USER_IDS_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.ARRAY,
  name: 'applicantPartnerUserIds',
  // Named as ids because that is what it renders. Applications is the readable list.
  label: 'Applicant Member IDs',
  description:
    'Internal RLS allowlist of workspace member ids. Read Applications for the applicants themselves. The app maintains this list — editing it by hand grants or removes partner access to the brief.',
  icon: 'IconLock',
  isNullable: true,
  isUIEditable: false,
});
