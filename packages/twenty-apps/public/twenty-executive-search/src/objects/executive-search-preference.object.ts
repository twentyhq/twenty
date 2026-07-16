import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from './executive-profile.object';

enum TravelWillingness {
  NONE = 'NONE',
  REGIONAL = 'REGIONAL',
  NATIONAL = 'NATIONAL',
  INTERNATIONAL = 'INTERNATIONAL',
}

enum Availability {
  IMMEDIATE = 'IMMEDIATE',
  TWO_WEEKS = 'TWO_WEEKS',
  ONE_MONTH = 'ONE_MONTH',
  THREE_MONTHS = 'THREE_MONTHS',
  NEGOTIABLE = 'NEGOTIABLE',
}

export const EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER =
  'a883f212-45ad-4f00-aec2-8236ea41ef03';

export const EXECUTIVE_SEARCH_PREFERENCE_EP_RELATION_UNIVERSAL_IDENTIFIER =
  '33ea88f5-78ec-4f85-afc8-af07cfaff5f1';

export const EXECUTIVE_SEARCH_PREFERENCE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER =
  '492231b1-69a8-49b2-89fc-9309a591502e';

export const EXECUTIVE_SEARCH_PREFERENCE_TRAVEL_FIELD_UNIVERSAL_IDENTIFIER =
  '77cd79bb-0f5a-4d85-8dab-0b31af7da292';

export const EXECUTIVE_SEARCH_PREFERENCE_AVAILABILITY_FIELD_UNIVERSAL_IDENTIFIER =
  '3fd73d1f-96f8-44cd-83b5-d8523b1270da';

export const EXECUTIVE_SEARCH_PREFERENCE_COMPENSATION_FIELD_UNIVERSAL_IDENTIFIER =
  '2498671b-614d-4fe6-b6d6-973ee05b1415';

export default defineObject({
  universalIdentifier: EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER,
  nameSingular: 'executiveSearchPreference',
  namePlural: 'executiveSearchPreferences',
  labelSingular: 'Search Preference',
  labelPlural: 'Search Preferences',
  description:
    'Search and placement preferences expressed by the executive (board types, industries, geography, travel, availability, compensation).',
  icon: 'IconSettings',
  labelIdentifierFieldMetadataUniversalIdentifier:
    '3cd04f31-7e59-4fa6-b42b-b858347460d5',
  fields: [
    // MANY_TO_ONE to executiveProfile
    {
      universalIdentifier:
        EXECUTIVE_SEARCH_PREFERENCE_EP_RELATION_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      name: 'executiveProfile',
      label: 'Executive Profile',
      description: 'The parent executive profile.',
      relationTargetObjectMetadataUniversalIdentifier:
        EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        EXECUTIVE_SEARCH_PREFERENCE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      universalIdentifier: '3cd04f31-7e59-4fa6-b42b-b858347460d5',
      type: FieldType.ARRAY,
      label: 'Board Types',
      description: 'Preferred board types (e.g. Public, Private, NonProfit).',
      icon: 'IconBuildingCommunity',
      name: 'boardTypes',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '79153ad1-5021-41d4-9db4-ed40e8e40aa3',
      type: FieldType.ARRAY,
      label: 'Industries',
      description: 'Preferred industries for board or executive roles.',
      icon: 'IconBuilding',
      name: 'industries',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '378e0f8d-c608-4667-8aa5-88059a4c3aea',
      type: FieldType.ARRAY,
      label: 'Company Sizes',
      description: 'Preferred company size ranges.',
      icon: 'IconChartBar',
      name: 'companySizes',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '6013e3eb-8e53-4890-bcfd-b18ccc1cdcc7',
      type: FieldType.ARRAY,
      label: 'Geographies',
      description: 'Preferred geographic regions.',
      icon: 'IconGlobe',
      name: 'geographies',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        EXECUTIVE_SEARCH_PREFERENCE_TRAVEL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Travel Willingness',
      description: 'Executive willingness to travel.',
      icon: 'IconPlane',
      options: [
        {
          id: '15325538-aa13-41fc-a28f-e7c3338ded18',
          value: TravelWillingness.NONE,
          label: 'None',
          position: 0,
          color: 'red',
        },
        {
          id: 'd2e2f074-00eb-449a-aebd-d298d09df77d',
          value: TravelWillingness.REGIONAL,
          label: 'Regional',
          position: 1,
          color: 'yellow',
        },
        {
          id: 'ca580e1b-b6df-4db3-afb1-9dffdd6696b0',
          value: TravelWillingness.NATIONAL,
          label: 'National',
          position: 2,
          color: 'blue',
        },
        {
          id: '00aaee37-6ace-434c-9a6c-62a4a2cff368',
          value: TravelWillingness.INTERNATIONAL,
          label: 'International',
          position: 3,
          color: 'green',
        },
      ],
      name: 'travelWillingness',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        EXECUTIVE_SEARCH_PREFERENCE_AVAILABILITY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Availability',
      description: 'Expected availability timeline.',
      icon: 'IconClock',
      options: [
        {
          id: '299b62fd-6b8a-4c07-ba57-46b86cf39be6',
          value: Availability.IMMEDIATE,
          label: 'Immediate',
          position: 0,
          color: 'green',
        },
        {
          id: 'b4296867-37ef-4cac-a730-73d2a2f86df5',
          value: Availability.TWO_WEEKS,
          label: 'Two Weeks',
          position: 1,
          color: 'blue',
        },
        {
          id: '626cecef-2e97-4c7d-85d8-fcc1f9ac15e4',
          value: Availability.ONE_MONTH,
          label: 'One Month',
          position: 2,
          color: 'yellow',
        },
        {
          id: 'a21a36e8-1f92-42c1-ab1b-36ac9f82c2e4',
          value: Availability.THREE_MONTHS,
          label: 'Three Months',
          position: 3,
          color: 'orange',
        },
        {
          id: '6b7e09a1-7f88-4b1d-aa26-69e40c0b8e8e',
          value: Availability.NEGOTIABLE,
          label: 'Negotiable',
          position: 4,
          color: 'gray',
        },
      ],
      name: 'availability',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        EXECUTIVE_SEARCH_PREFERENCE_COMPENSATION_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Compensation Expectation',
      description:
        'RESTRICTED: Executive compensation expectations — access limited to authorized roles.',
      icon: 'IconCash',
      name: 'compensationExpectation',
      isNullable: true,
      defaultValue: null,
    },
  ],
  indexes: [
    {
      universalIdentifier: 'ea0c7a3e-d218-4311-b50a-5f9ea6edf532',
      objectUniversalIdentifier:
        EXECUTIVE_SEARCH_PREFERENCE_UNIVERSAL_IDENTIFIER,
      name: 'idx_executiveSearchPreference_executiveProfileId',
      fields: [
        {
          universalIdentifier: 'e4c3be48-d71c-44c9-8f58-79adbcd4978f',
          fieldName: 'executiveProfile',
        },
      ],
    },
  ],
});
