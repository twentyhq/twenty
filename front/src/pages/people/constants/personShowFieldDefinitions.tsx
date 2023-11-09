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
import { FieldDefinition } from '@/ui/object/field/types/FieldDefinition';
import {
  FieldDateMetadata,
  FieldMetadata,
  FieldPhoneMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
} from '@/ui/object/field/types/FieldMetadata';
import { Company } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

export const personShowFieldDefinition: FieldDefinition<FieldMetadata>[] = [
  {
    fieldMetadataId: 'email',
    label: 'Email',
    Icon: IconMail,
    type: 'TEXT',
    metadata: {
      fieldName: 'email',
      placeHolder: 'Email',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    fieldMetadataId: 'company',
    label: 'Company',
    Icon: IconBuildingSkyscraper,
    type: 'RELATION',
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
    fieldMetadataId: 'phone',
    label: 'Phone',
    Icon: IconPhone,
    type: 'PHONE',
    metadata: {
      fieldName: 'phone',
      placeHolder: 'Phone',
    },
  } satisfies FieldDefinition<FieldPhoneMetadata>,
  {
    fieldMetadataId: 'jobTitle',
    label: 'Job Title',
    Icon: IconBriefcase,
    type: 'TEXT',
    metadata: {
      fieldName: 'jobTitle',
      placeHolder: 'Job Title',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    fieldMetadataId: 'city',
    label: 'City',
    Icon: IconMap,
    type: 'TEXT',
    metadata: {
      fieldName: 'city',
      placeHolder: 'City',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    fieldMetadataId: 'linkedinUrl',
    label: 'Linkedin URL',
    Icon: IconBrandLinkedin,
    type: 'URL',
    metadata: {
      fieldName: 'linkedinUrl',
      placeHolder: 'Linkedin URL',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    fieldMetadataId: 'xUrl',
    label: 'X URL',
    Icon: IconBrandX,
    type: 'URL',
    metadata: {
      fieldName: 'xUrl',
      placeHolder: 'X URL',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    fieldMetadataId: 'createdAt',
    label: 'Created at',
    Icon: IconCalendar,
    type: 'DATE',
    metadata: {
      fieldName: 'createdAt',
    },
  } satisfies FieldDefinition<FieldDateMetadata>,
];
