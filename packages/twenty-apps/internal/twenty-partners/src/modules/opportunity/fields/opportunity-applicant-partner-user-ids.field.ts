import {
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

export const OPPORTUNITY_APPLICANT_PARTNER_USER_IDS_FIELD_ID =
  '223ec774-6cd6-4c19-8f32-308faa6b80b1';

// RLS cannot join Opportunity → Application, so applicant member ids live on the
// opportunity. After unlist, (partnerUser IS me) OR (isListed) is not enough.
export default defineField({
  universalIdentifier: OPPORTUNITY_APPLICANT_PARTNER_USER_IDS_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.ARRAY,
  name: 'applicantPartnerUserIds',
  label: 'Applicant Members',
  icon: 'IconUsers',
  isNullable: true,
});
