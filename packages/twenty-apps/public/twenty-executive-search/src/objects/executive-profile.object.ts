import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';

export const EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER =
  '72779c7c-a065-4091-8a9f-95d55da24c05';

export const EXECUTIVE_PROFILE_PERSON_RELATION_UNIVERSAL_IDENTIFIER =
  'bd3eb0d2-7527-4ea3-bc87-03b2180eb8bd';

export const EXECUTIVE_PROFILE_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '2494faac-0170-4035-938f-a6f22e48edc8';

export const EXECUTIVE_PROFILE_HEADLINE_FIELD_UNIVERSAL_IDENTIFIER =
  '1f4e0d1e-b210-4e2c-8b90-d012d2ccd65c';

export const EXECUTIVE_PROFILE_TAGLINE_FIELD_UNIVERSAL_IDENTIFIER =
  'cbaf9d19-1071-41dd-9ca2-b8e8c8188162';

export const EXECUTIVE_PROFILE_LOCATION_FIELD_UNIVERSAL_IDENTIFIER =
  '70345847-da04-4312-843e-fa63d56e1ec4';

export const EXECUTIVE_PROFILE_INDUSTRY_FIELD_UNIVERSAL_IDENTIFIER =
  'f20e3b62-01ea-453b-a33e-c3801bc363a7';

export const EXECUTIVE_PROFILE_COMPLETENESS_FIELD_UNIVERSAL_IDENTIFIER =
  '109505ea-9e89-492a-9d7f-7c32d6aecb1c';

export const EXECUTIVE_PROFILE_DIRECTUS_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '7b49aa96-2feb-42b7-ae60-29690dc9205b';

export const EXECUTIVE_PROFILE_SOURCE_UPDATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '3eebffde-3cf7-4d54-b30b-d93a175429b7';

export const EXECUTIVE_PROFILE_SOURCE_HASH_FIELD_UNIVERSAL_IDENTIFIER =
  'e536f153-2b57-442d-93f2-207c31b723d5';

// UID for the reverse relation field on the standard person object
export const EXECUTIVE_PROFILE_PERSON_REVERSE_RELATION_UNIVERSAL_IDENTIFIER =
  '9fa2d87d-2c1f-49f9-a9b8-cdaaba11f22c';

// UID for the person-to-executiveProfile relation defined as a standalone field on person
export const PERSON_EXECUTIVE_PROFILES_RELATION_UNIVERSAL_IDENTIFIER =
  EXECUTIVE_PROFILE_PERSON_REVERSE_RELATION_UNIVERSAL_IDENTIFIER;

export default defineObject({
  universalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
  nameSingular: 'executiveProfile',
  namePlural: 'executiveProfiles',
  labelSingular: 'Executive Profile',
  labelPlural: 'Executive Profiles',
  description:
    'Aggregate executive identity linking a Twenty person to enriched career, education, board, capability, artifact, preference, and external-profile data from Directus and other sources.',
  icon: 'IconUserCircle',
  labelIdentifierFieldMetadataUniversalIdentifier:
    EXECUTIVE_PROFILE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    // RELATION to standard person (MANY_TO_ONE)
    {
      universalIdentifier: EXECUTIVE_PROFILE_PERSON_RELATION_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      name: 'person',
      label: 'Person',
      description: 'The Twenty person record that this executive profile enriches.',
      relationTargetObjectMetadataUniversalIdentifier:
        '20202020-e674-48e5-a542-72570eee7213',
      relationTargetFieldMetadataUniversalIdentifier:
        EXECUTIVE_PROFILE_PERSON_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      universalIdentifier:
        EXECUTIVE_PROFILE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Name',
      description: 'Display name for the executive profile.',
      icon: 'IconAbc',
      name: 'name',
    },
    {
      universalIdentifier:
        EXECUTIVE_PROFILE_HEADLINE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Headline',
      description: 'Professional headline for the executive.',
      icon: 'IconQuote',
      name: 'headline',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        EXECUTIVE_PROFILE_TAGLINE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Tagline',
      description: 'Short tagline or personal motto.',
      icon: 'IconMessage',
      name: 'tagline',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        EXECUTIVE_PROFILE_LOCATION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Location',
      description: 'Geographic location (city, region).',
      icon: 'IconMapPin',
      name: 'location',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        EXECUTIVE_PROFILE_INDUSTRY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Industry',
      description: 'Primary industry classification.',
      icon: 'IconBuilding',
      name: 'industry',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        EXECUTIVE_PROFILE_COMPLETENESS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.NUMBER,
      label: 'Profile Completeness',
      description: 'Aggregate completeness score (0–100).',
      icon: 'IconProgressCheck',
      name: 'profileCompleteness',
      isNullable: true,
      defaultValue: null,
    },
    // Source provenance fields
    {
      universalIdentifier:
        EXECUTIVE_PROFILE_DIRECTUS_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Directus ID',
      description: 'Source record ID from the Directus executives collection.',
      icon: 'IconDatabase',
      name: 'directusId',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        EXECUTIVE_PROFILE_SOURCE_UPDATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      label: 'Source Updated At',
      description: 'Timestamp of the last update in the source system.',
      icon: 'IconClock',
      name: 'sourceUpdatedAt',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        EXECUTIVE_PROFILE_SOURCE_HASH_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Source Hash',
      description: 'Content hash from the source system for change detection.',
      icon: 'IconHash',
      name: 'sourceHash',
      isNullable: true,
      defaultValue: null,
    },
  ],
  indexes: [
    {
      universalIdentifier: '3e939a98-88d7-454e-b63e-3d775c6287c3',
      objectUniversalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
      name: 'idx_executiveProfile_personId',
      fields: [
        {
          universalIdentifier: '53be26cb-4458-42b6-9c0e-2d8e7cf5e8c1',
          fieldName: 'person',
        },
      ],
    },
    {
      universalIdentifier: 'e0e1fb02-495b-4bf6-8a32-02c1506eadc9',
      objectUniversalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
      name: 'idx_executiveProfile_directusId',
      isUnique: true,
      fields: [
        {
          universalIdentifier: '22bdf0ac-35b5-4e1a-ac83-2e91f68e8b1f',
          fieldName: 'directusId',
        },
      ],
    },
  ],
});
