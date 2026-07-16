import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from './executive-profile.object';

enum LanguageProficiency {
  BASIC = 'BASIC',
  CONVERSATIONAL = 'CONVERSATIONAL',
  PROFESSIONAL = 'PROFESSIONAL',
  NATIVE = 'NATIVE',
}

export const EXECUTIVE_LANGUAGE_UNIVERSAL_IDENTIFIER =
  'e487f1bf-e0cf-4c07-b74b-fab776d29682';

export const EXECUTIVE_LANGUAGE_EP_RELATION_UNIVERSAL_IDENTIFIER =
  '69d7bf86-1a96-4e09-9095-83e3ec93846b';

export const EXECUTIVE_LANGUAGE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER =
  'a8e5c0c2-74cc-4c57-8302-e3d1c1ad0654';

export const EXECUTIVE_LANGUAGE_PROFICIENCY_FIELD_UNIVERSAL_IDENTIFIER =
  'cd7e6072-c571-42ef-adf4-a4e4cb18b05a';

export default defineObject({
  universalIdentifier: EXECUTIVE_LANGUAGE_UNIVERSAL_IDENTIFIER,
  nameSingular: 'executiveLanguage',
  namePlural: 'executiveLanguages',
  labelSingular: 'Language',
  labelPlural: 'Languages',
  description:
    'A language the executive speaks, with a self-assessed or verified proficiency level.',
  icon: 'IconLanguage',
  labelIdentifierFieldMetadataUniversalIdentifier:
    '75742b87-4323-4491-89b1-67286252b1ec',
  fields: [
    // MANY_TO_ONE to executiveProfile
    {
      universalIdentifier:
        EXECUTIVE_LANGUAGE_EP_RELATION_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      name: 'executiveProfile',
      label: 'Executive Profile',
      description: 'The parent executive profile.',
      relationTargetObjectMetadataUniversalIdentifier:
        EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        EXECUTIVE_LANGUAGE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      universalIdentifier: '75742b87-4323-4491-89b1-67286252b1ec',
      type: FieldType.TEXT,
      label: 'Language',
      description: 'Name of the language.',
      icon: 'IconLanguage',
      name: 'language',
    },
    {
      universalIdentifier:
        EXECUTIVE_LANGUAGE_PROFICIENCY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Proficiency',
      description: 'Self-assessed or verified proficiency level.',
      icon: 'IconStars',
      options: [
        {
          id: 'f0b3b8f0-c61e-4917-bcdc-dd7adbaf5078',
          value: LanguageProficiency.BASIC,
          label: 'Basic',
          position: 0,
          color: 'gray',
        },
        {
          id: '9ab7e5c7-5ee4-4608-b7af-0fb7d80e5bb9',
          value: LanguageProficiency.CONVERSATIONAL,
          label: 'Conversational',
          position: 1,
          color: 'blue',
        },
        {
          id: '08ccf351-1c3a-4b5f-aa66-1b110c1b6a63',
          value: LanguageProficiency.PROFESSIONAL,
          label: 'Professional',
          position: 2,
          color: 'yellow',
        },
        {
          id: '5a99b50b-8be1-4125-8d44-6425f6f55825',
          value: LanguageProficiency.NATIVE,
          label: 'Native',
          position: 3,
          color: 'green',
        },
      ],
      name: 'proficiency',
      defaultValue: `'${LanguageProficiency.BASIC}'`,
    },
  ],
  indexes: [
    {
      universalIdentifier: '007b8383-a18a-4a9d-8a7c-1d15f16f9483',
      objectUniversalIdentifier: EXECUTIVE_LANGUAGE_UNIVERSAL_IDENTIFIER,
      name: 'idx_executiveLanguage_executiveProfileId',
      fields: [
        {
          universalIdentifier: 'f1475baf-d60c-4da5-9f0f-710a3d39b160',
          fieldName: 'executiveProfile',
        },
      ],
    },
  ],
});
