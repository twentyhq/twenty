import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from './executive-profile.object';

export const EXECUTIVE_EDUCATION_UNIVERSAL_IDENTIFIER =
  'c9086639-dd19-4ba3-96db-f33d8c29ed6a';

export const EXECUTIVE_EDUCATION_EP_RELATION_UNIVERSAL_IDENTIFIER =
  'af8c8985-75b6-4dc0-b923-3e8caceeff55';

export const EXECUTIVE_EDUCATION_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER =
  '925bbc3c-c0b5-4960-a61f-4e7f096b59fc';

export default defineObject({
  universalIdentifier: EXECUTIVE_EDUCATION_UNIVERSAL_IDENTIFIER,
  nameSingular: 'executiveEducation',
  namePlural: 'executiveEducations',
  labelSingular: 'Education',
  labelPlural: 'Educations',
  description:
    'An educational qualification or degree earned by the executive.',
  icon: 'IconSchool',
  labelIdentifierFieldMetadataUniversalIdentifier:
    'bd43eaee-a004-47f7-b17a-19f9f48ef386',
  fields: [
    // MANY_TO_ONE to executiveProfile
    {
      universalIdentifier:
        EXECUTIVE_EDUCATION_EP_RELATION_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      name: 'executiveProfile',
      label: 'Executive Profile',
      description: 'The parent executive profile.',
      relationTargetObjectMetadataUniversalIdentifier:
        EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        EXECUTIVE_EDUCATION_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      universalIdentifier: 'bd43eaee-a004-47f7-b17a-19f9f48ef386',
      type: FieldType.TEXT,
      label: 'Institution',
      description: 'Name of the educational institution.',
      icon: 'IconSchool',
      name: 'institution',
    },
    {
      universalIdentifier: '8f8ce842-d10d-471c-8374-4ec9c9a96310',
      type: FieldType.TEXT,
      label: 'Degree',
      description: 'Degree or credential earned.',
      icon: 'IconAward',
      name: 'degree',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '8e00c6f9-8208-4420-840d-452441971bad',
      type: FieldType.TEXT,
      label: 'Field of Study',
      description: 'Area of study or concentration.',
      icon: 'IconBook',
      name: 'fieldOfStudy',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '5e6e865b-1064-440e-b198-8b1cefcc9f5a',
      type: FieldType.DATE,
      label: 'Start Date',
      description: 'Start date of the education.',
      icon: 'IconCalendar',
      name: 'startDate',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '5bda1880-54ce-4336-8e9c-f6654bedd426',
      type: FieldType.DATE,
      label: 'End Date',
      description: 'End date or graduation date.',
      icon: 'IconCalendarOff',
      name: 'endDate',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'f729a6a9-a51e-465f-b06e-0a1ddf9adb6c',
      type: FieldType.TEXT,
      label: 'Source Hash',
      description: 'Content hash from the source system.',
      icon: 'IconHash',
      name: 'sourceHash',
      isNullable: true,
      defaultValue: null,
    },
  ],
  indexes: [
    {
      universalIdentifier: '29684562-b6ea-4e66-a5d2-5c54d13a60b8',
      objectUniversalIdentifier: EXECUTIVE_EDUCATION_UNIVERSAL_IDENTIFIER,
      name: 'idx_executiveEducation_executiveProfileId',
      fields: [
        {
          universalIdentifier: '67c3fc87-bd0a-4a4f-ad56-b8c9ecb259d0',
          fieldName: 'executiveProfile',
        },
      ],
    },
  ],
});
