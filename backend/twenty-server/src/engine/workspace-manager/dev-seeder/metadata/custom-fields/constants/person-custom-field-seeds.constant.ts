import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const PERSON_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    name: 'intro',
    label: 'Intro',
    description: "Contact's Intro",
    icon: 'IconNote',
    isActive: true,
    isNullable: true,
    isUnique: false,
  },
  {
    type: FieldMetadataType.PHONES,
    name: 'whatsapp',
    label: 'Whatsapp',
    description: "Contact's Whatsapp Number",
    icon: 'IconBrandWhatsapp',
    isActive: true,
    isNullable: false,
    isUnique: false,
    defaultValue: {
      primaryPhoneNumber: "''",
      primaryPhoneCountryCode: "'FR'",
      primaryPhoneCallingCode: "'+33'",
      additionalPhones: null,
    },
  },
  {
    type: FieldMetadataType.MULTI_SELECT,
    name: 'workPreference',
    label: 'Work Preference',
    description: "Person's Work Preference",
    icon: 'IconHome',
    isActive: true,
    isNullable: true,
    isUnique: false,
    options: [
      {
        color: 'green',
        label: 'On-Site',
        position: 0,
        value: 'ON_SITE',
      },
      {
        color: 'turquoise',
        label: 'Hybrid',
        position: 1,
        value: 'HYBRID',
      },
      {
        color: 'sky',
        label: 'Remote Work',
        position: 2,
        value: 'REMOTE_WORK',
      },
    ],
  },
  {
    type: FieldMetadataType.RATING,
    name: 'performanceRating',
    label: 'Performance Rating',
    description: "Person's Performance Rating",
    icon: 'IconStars',
    isActive: true,
    isNullable: true,
    isUnique: false,
    options: [
      {
        label: '1',
        value: 'RATING_1',
        position: 0,
      },
      {
        label: '2',
        value: 'RATING_2',
        position: 1,
      },
      {
        label: '3',
        value: 'RATING_3',
        position: 2,
      },
      {
        label: '4',
        value: 'RATING_4',
        position: 3,
      },
      {
        label: '5',
        value: 'RATING_5',
        position: 4,
      },
    ],
  },
];
