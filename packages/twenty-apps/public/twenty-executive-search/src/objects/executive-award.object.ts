import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from './executive-profile.object';

export const EXECUTIVE_AWARD_UNIVERSAL_IDENTIFIER =
  '12155bcf-fb8c-4fa6-88f8-2201af96ad40';

export const EXECUTIVE_AWARD_EP_RELATION_UNIVERSAL_IDENTIFIER =
  '7f04947f-4e74-464a-a3e1-d37a38167616';

export const EXECUTIVE_AWARD_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER =
  'ad1f48d1-963d-44ad-bf60-a55caceba89a';

export default defineObject({
  universalIdentifier: EXECUTIVE_AWARD_UNIVERSAL_IDENTIFIER,
  nameSingular: 'executiveAward',
  namePlural: 'executiveAwards',
  labelSingular: 'Award',
  labelPlural: 'Awards',
  description: 'An award or honor received by the executive.',
  icon: 'IconTrophy',
  labelIdentifierFieldMetadataUniversalIdentifier:
    'bef0e576-3d46-45ff-adf0-8165d7139062',
  fields: [
    // MANY_TO_ONE to executiveProfile
    {
      universalIdentifier:
        EXECUTIVE_AWARD_EP_RELATION_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      name: 'executiveProfile',
      label: 'Executive Profile',
      description: 'The parent executive profile.',
      relationTargetObjectMetadataUniversalIdentifier:
        EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        EXECUTIVE_AWARD_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      universalIdentifier: 'bef0e576-3d46-45ff-adf0-8165d7139062',
      type: FieldType.TEXT,
      label: 'Title',
      description: 'Title of the award or honor.',
      icon: 'IconTrophy',
      name: 'title',
    },
    {
      universalIdentifier: '12ff3cee-c0e8-408a-960a-52e024be2940',
      type: FieldType.TEXT,
      label: 'Issuer',
      description: 'Organization that issued the award.',
      icon: 'IconBuilding',
      name: 'issuer',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '79e42d30-0bc1-4121-a90d-2641be29c687',
      type: FieldType.DATE,
      label: 'Award Date',
      description: 'Date the award was received.',
      icon: 'IconCalendar',
      name: 'awardDate',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'ca58bd9b-9597-4eff-895b-738ebb4fb758',
      type: FieldType.TEXT,
      label: 'Verification Evidence',
      description: 'Optional reference or note on verification.',
      icon: 'IconClipboardCheck',
      name: 'verificationEvidence',
      isNullable: true,
      defaultValue: null,
    },
  ],
  indexes: [
    {
      universalIdentifier: 'becc65c9-02c7-4511-b72e-ff9aba688fdc',
      objectUniversalIdentifier: EXECUTIVE_AWARD_UNIVERSAL_IDENTIFIER,
      name: 'idx_executiveAward_executiveProfileId',
      fields: [
        {
          universalIdentifier: 'b1965aa0-484b-4a2e-9aca-7be02af5af60',
          fieldName: 'executiveProfile',
        },
      ],
    },
  ],
});
