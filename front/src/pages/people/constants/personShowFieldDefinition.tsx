import { FieldDefinition } from '@/ui/field/types/FieldDefinition';
import {
  FieldDateMetadata,
  FieldMetadata,
  FieldPhoneMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
} from '@/ui/field/types/FieldMetadata';
import {
  IconBrandLinkedin,
  IconBrandX,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconMail,
  IconMap,
  IconPencil,
  IconPhone,
} from '@/ui/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { Company } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

export const personShowFieldDefinition: FieldDefinition<FieldMetadata>[] = [
  {
    key: 'email',
    name: 'Email',
    Icon: IconMail,
    type: 'text',
    metadata: {
      fieldName: 'email',
      placeHolder: 'Email',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    key: 'company',
    name: 'Company',
    Icon: IconBuildingSkyscraper,
    type: 'relation',
    buttonIcon: IconPencil,
    metadata: {
      fieldName: 'company',
      relationType: Entity.Company,
    },
    entityChipDisplayMapper: (dataObject: Company) => {
      return {
        name: dataObject?.name,
        pictureUrl: getLogoUrlFromDomainName(dataObject?.domainName),
        avatarType: 'squared',
      };
    },
  } satisfies FieldDefinition<FieldRelationMetadata>,
  {
    key: 'phone',
    name: 'Phone',
    Icon: IconPhone,
    type: 'phone',
    metadata: {
      fieldName: 'phone',
      placeHolder: 'Phone',
    },
    buttonIcon: IconPencil,
  } satisfies FieldDefinition<FieldPhoneMetadata>,
  {
    key: 'jobTitle',
    name: 'Job Title',
    Icon: IconBriefcase,
    type: 'text',
    metadata: {
      fieldName: 'jobTitle',
      placeHolder: 'Job Title',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    key: 'city',
    name: 'City',
    Icon: IconMap,
    type: 'text',
    metadata: {
      fieldName: 'city',
      placeHolder: 'City',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    key: 'linkedinUrl',
    name: 'Linkedin URL',
    Icon: IconBrandLinkedin,
    type: 'url',
    metadata: {
      fieldName: 'linkedinUrl',
      placeHolder: 'Linkedin URL',
    },
    buttonIcon: IconPencil,
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    key: 'xUrl',
    name: 'X URL',
    Icon: IconBrandX,
    type: 'url',
    metadata: {
      fieldName: 'xUrl',
      placeHolder: 'X URL',
    },
    buttonIcon: IconPencil,
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    key: 'createdAt',
    name: 'Created at',
    Icon: IconCalendar,
    type: 'date',
    metadata: {
      fieldName: 'createdAt',
    },
  } satisfies FieldDefinition<FieldDateMetadata>,
];
