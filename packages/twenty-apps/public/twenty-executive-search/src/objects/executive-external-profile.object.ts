import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from './executive-profile.object';

export const EXECUTIVE_EXTERNAL_PROFILE_UNIVERSAL_IDENTIFIER =
  '5c563e99-936e-4d88-a426-ad58bf63cd54';

export const EXECUTIVE_EXTERNAL_PROFILE_EP_RELATION_UNIVERSAL_IDENTIFIER =
  'ee27b5b0-cc32-4358-b28f-7afc53d7cd86';

export const EXECUTIVE_EXTERNAL_PROFILE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER =
  '21fb3e70-b006-4868-9b03-529214aed541';

export default defineObject({
  universalIdentifier: EXECUTIVE_EXTERNAL_PROFILE_UNIVERSAL_IDENTIFIER,
  nameSingular: 'executiveExternalProfile',
  namePlural: 'executiveExternalProfiles',
  labelSingular: 'External Profile',
  labelPlural: 'External Profiles',
  description:
    'A link to an external professional profile (LinkedIn, etc.) for an executive.',
  icon: 'IconExternalLink',
  labelIdentifierFieldMetadataUniversalIdentifier:
    '42e3730e-cead-4991-b9cc-eac871fd2d75',
  fields: [
    // MANY_TO_ONE to executiveProfile
    {
      universalIdentifier:
        EXECUTIVE_EXTERNAL_PROFILE_EP_RELATION_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      name: 'executiveProfile',
      label: 'Executive Profile',
      description: 'The parent executive profile.',
      relationTargetObjectMetadataUniversalIdentifier:
        EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        EXECUTIVE_EXTERNAL_PROFILE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      universalIdentifier: '42e3730e-cead-4991-b9cc-eac871fd2d75',
      type: FieldType.TEXT,
      label: 'Platform',
      description: 'Name of the external platform (e.g. LinkedIn).',
      icon: 'IconBrandLinkedin',
      name: 'platform',
    },
    {
      universalIdentifier: '7e8b1c46-4ac3-4f22-b2f4-9c358283ad26',
      type: FieldType.TEXT,
      label: 'URL',
      description: 'Full URL to the external profile.',
      icon: 'IconLink',
      name: 'url',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '6d02d749-54a7-4cf4-b0d9-5ef26a2b1dc0',
      type: FieldType.BOOLEAN,
      label: 'Job Relevant Only',
      description: 'Whether this profile should be restricted to job-relevant context.',
      icon: 'IconBriefcase',
      name: 'jobRelevantOnly',
      defaultValue: `'false'`,
    },
  ],
  indexes: [
    {
      universalIdentifier: '40e13ca3-4a80-44d5-8956-c651838a5ae8',
      objectUniversalIdentifier:
        EXECUTIVE_EXTERNAL_PROFILE_UNIVERSAL_IDENTIFIER,
      name: 'idx_executiveExternalProfile_executiveProfileId',
      fields: [
        {
          universalIdentifier: '8cfed9bd-b0e3-4252-8e16-b18c266e31e8',
          fieldName: 'executiveProfile',
        },
      ],
    },
  ],
});
