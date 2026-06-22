import {
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineObject,
} from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER =
  'f17ec4d0-00c5-4137-9c8b-5507934d80cf';

export const APPLICATION_NAME_FIELD_ID = '51ff5f75-9df2-485f-8852-22484ae0cc3e';
export const APPLICATION_OPPORTUNITY_FIELD_ID =
  '8aba48ca-1bfb-4141-b64d-b23d7f5fc41f';
export const APPLICATIONS_ON_OPPORTUNITY_FIELD_ID =
  '4a6ce47b-a56b-4b21-81f4-83021fb0e09d';
export const APPLICATION_PARTNER_FIELD_ID =
  '2ab5b079-fef3-452c-b4c0-a32ca1709157';
export const APPLICATIONS_ON_PARTNER_FIELD_ID =
  'e36002c5-f71b-4048-953a-79f68baba4e2';
export const APPLICATION_PARTNER_USER_FIELD_ID =
  '2895bcbb-df5a-4faa-af70-097729c1dd01';
export const APPLICATIONS_AS_PARTNER_USER_FIELD_ID =
  '1010f214-ab3f-43aa-a19e-d351bddc2d61';
export const APPLICATION_STATE_FIELD_ID =
  'c686db4f-f0e9-41a0-bdb3-3b4024ff59b6';
export const APPLICATION_PITCH_FIELD_ID =
  '0a6cd9c9-e1e9-4315-8356-b72077443805';
export const APPLICATION_LAST_ACTIVITY_AT_FIELD_ID =
  'b184ac02-51b2-4442-9505-2b06f5c94112';

export default defineObject({
  universalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'application',
  namePlural: 'applications',
  labelSingular: 'Application',
  labelPlural: 'Applications',
  description: 'A partner in play on an opportunity-brief — invited or applied',
  icon: 'IconSend',
  isSearchable: false,
  labelIdentifierFieldMetadataUniversalIdentifier: APPLICATION_NAME_FIELD_ID,
  fields: [
    {
      universalIdentifier: APPLICATION_NAME_FIELD_ID,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconTag',
      defaultValue: "''",
    },
    {
      universalIdentifier: APPLICATION_OPPORTUNITY_FIELD_ID,
      type: FieldType.RELATION,
      name: 'opportunity',
      label: 'Opportunity',
      icon: 'IconTargetArrow',
      isNullable: true,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        APPLICATIONS_ON_OPPORTUNITY_FIELD_ID,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'opportunityId',
      },
    },
    {
      universalIdentifier: APPLICATION_PARTNER_FIELD_ID,
      type: FieldType.RELATION,
      name: 'partner',
      label: 'Partner',
      icon: 'IconBuildingStore',
      isNullable: true,
      relationTargetObjectMetadataUniversalIdentifier:
        PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        APPLICATIONS_ON_PARTNER_FIELD_ID,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'partnerId',
      },
    },
    {
      // RLS pivot (B7): the applying member. Populated by the apply logic-function (B4);
      // left null for admin-created invites until then. Locked from partner edits in B7.
      universalIdentifier: APPLICATION_PARTNER_USER_FIELD_ID,
      type: FieldType.RELATION,
      name: 'partnerUser',
      label: 'Partner User',
      isNullable: true,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        APPLICATIONS_AS_PARTNER_USER_FIELD_ID,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.SET_NULL,
        joinColumnName: 'partnerUserId',
      },
    },
    {
      // Candidacy funnel. WON is set ONLY by on-opportunity-partner-won (Task 3) — a locked
      // mirror of Opportunity.partner, never a user-set value.
      universalIdentifier: APPLICATION_STATE_FIELD_ID,
      type: FieldType.SELECT,
      name: 'state',
      label: 'State',
      icon: 'IconProgressCheck',
      isNullable: false,
      // Self-apply is the primary path → default APPLIED so a partner who applies never sees a
      // misleading "Invited" flicker while on-application-created (async) stamps the candidacy.
      // Admin invites are a manual action that explicitly sets INVITED.
      defaultValue: "'APPLIED'",
      options: [
        { id: '7f9d5ae7-64be-4269-8fab-3cfeaf352bcb', value: 'APPLIED', label: 'Applied', position: 0, color: 'blue' },
        { id: '2ce94524-4ac3-4a4a-a87c-5c9841eced7c', value: 'INVITED', label: 'Invited', position: 1, color: 'gray' },
        { id: 'e4e3d579-17ef-4ef8-b9be-54f7d361ad51', value: 'INTRODUCED', label: 'Introduced', position: 2, color: 'purple' },
        { id: '66ff342c-577b-4a84-bbdc-4ffbfa0bdd0e', value: 'WON', label: 'Won', position: 3, color: 'green' },
        { id: '83846e19-5008-4f06-b62d-7a1f0dad23e2', value: 'DECLINED', label: 'Declined', position: 4, color: 'red' },
        { id: '124f7e81-39b4-47cc-83f7-7dfb81ea751d', value: 'BACKUP', label: 'Backup', position: 5, color: 'orange' },
      ],
    },
    {
      universalIdentifier: APPLICATION_PITCH_FIELD_ID,
      type: FieldType.TEXT,
      name: 'pitch',
      label: 'Pitch',
      icon: 'IconMessage',
      isNullable: true,
    },
    {
      universalIdentifier: APPLICATION_LAST_ACTIVITY_AT_FIELD_ID,
      type: FieldType.DATE_TIME,
      name: 'lastActivityAt',
      label: 'Last Activity At',
      icon: 'IconClock',
      isNullable: true,
    },
  ],
});
