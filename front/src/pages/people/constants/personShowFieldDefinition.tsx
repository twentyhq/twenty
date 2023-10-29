import { FieldDefinition } from '@/ui/data/field/types/FieldDefinition';
import {
  FieldDateMetadata,
  FieldMetadata,
  FieldPhoneMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
} from '@/ui/data/field/types/FieldMetadata';
import {
  IconBrandLinkedin,
  IconBrandX,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconMail,
  IconMap,
  IconPhone,
} from '@/ui/display/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { Company } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

export const personShowFieldDefinition: FieldDefinition<FieldMetadata>[] = [
  {
    fieldId: 'email',
    label: 'Email',
    Icon: IconMail,
    type: 'text',
    metadata: {
      fieldName: 'email',
      placeHolder: 'Email',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    fieldId: 'company',
    label: 'Company',
    Icon: IconBuildingSkyscraper,
    type: 'relation',
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
    fieldId: 'phone',
    label: 'Phone',
    Icon: IconPhone,
    type: 'phone',
    metadata: {
      fieldName: 'phone',
      placeHolder: 'Phone',
    },
  } satisfies FieldDefinition<FieldPhoneMetadata>,
  {
    fieldId: 'jobTitle',
    label: 'Job Title',
    Icon: IconBriefcase,
    type: 'text',
    metadata: {
      fieldName: 'jobTitle',
      placeHolder: 'Job Title',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    fieldId: 'city',
    label: 'City',
    Icon: IconMap,
    type: 'text',
    metadata: {
      fieldName: 'city',
      placeHolder: 'City',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    fieldId: 'linkedinUrl',
    label: 'Linkedin URL',
    Icon: IconBrandLinkedin,
    type: 'url',
    metadata: {
      fieldName: 'linkedinUrl',
      placeHolder: 'Linkedin URL',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    fieldId: 'xUrl',
    label: 'X URL',
    Icon: IconBrandX,
    type: 'url',
    metadata: {
      fieldName: 'xUrl',
      placeHolder: 'X URL',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    fieldId: 'createdAt',
    label: 'Created at',
    Icon: IconCalendar,
    type: 'date',
    metadata: {
      fieldName: 'createdAt',
    },
  } satisfies FieldDefinition<FieldDateMetadata>,
];
