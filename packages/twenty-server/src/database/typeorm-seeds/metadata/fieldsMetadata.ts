import { FieldMetadataType } from 'twenty-shared';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

export const getDevSeedCompanyCustomFields = (
  objectMetadataId: string,
  workspaceId: string,
): CreateFieldInput[] => {
  return [
    {
      workspaceId,
      type: FieldMetadataType.TEXT,
      name: 'tagline',
      label: 'Tagline',
      description: "Company's Tagline",
      icon: 'IconAdCircle',
      isActive: true,
      isNullable: false,
      isUnique: false,
      defaultValue: "''",
      objectMetadataId,
    },
    {
      workspaceId,
      type: FieldMetadataType.LINKS,
      name: 'introVideo',
      label: 'Intro Video',
      description: "Company's Intro Video",
      icon: 'IconVideo',
      isActive: true,
      isNullable: true,
      isUnique: false,
      objectMetadataId,
    },
    {
      workspaceId,
      type: FieldMetadataType.MULTI_SELECT,
      name: 'workPolicy',
      label: 'Work Policy',
      description: "Company's Work Policy",
      icon: 'IconHome',
      isActive: true,
      isNullable: true,
      isUnique: false,
      objectMetadataId,
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
      workspaceId,
      type: FieldMetadataType.BOOLEAN,
      name: 'visaSponsorship',
      label: 'Visa Sponsorship',
      description: "Company's Visa Sponsorship Policy",
      icon: 'IconBrandVisa',
      isActive: true,
      isNullable: true,
      isUnique: false,
      objectMetadataId,
      defaultValue: false,
    },
  ];
};

export const getDevSeedPeopleCustomFields = (
  objectMetadataId: string,
  workspaceId: string,
): CreateFieldInput[] => {
  return [
    {
      workspaceId,
      type: FieldMetadataType.TEXT,
      name: 'intro',
      label: 'Intro',
      description: "Contact's Intro",
      icon: 'IconNote',
      isActive: true,
      isNullable: true,
      isUnique: false,
      objectMetadataId,
    },
    {
      workspaceId,
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
      objectMetadataId,
    },
    {
      workspaceId,
      type: FieldMetadataType.MULTI_SELECT,
      name: 'workPreference',
      label: 'Work Preference',
      description: "Person's Work Preference",
      icon: 'IconHome',
      isActive: true,
      isNullable: true,
      isUnique: false,
      objectMetadataId,
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
      workspaceId,
      type: FieldMetadataType.RATING,
      name: 'performanceRating',
      label: 'Performance Rating',
      description: "Person's Performance Rating",
      icon: 'IconStars',
      isActive: true,
      isNullable: true,
      isUnique: false,
      objectMetadataId,
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
};
