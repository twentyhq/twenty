import {
  IconBrandLinkedin,
  IconBrandX,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/display/icon/index';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import {
  FieldDateMetadata,
  FieldDoubleTextChipMetadata,
  FieldEmailMetadata,
  FieldMetadata,
  FieldPhoneMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
} from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';
import { Company } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

export const peopleAvailableFieldDefinitions: ColumnDefinition<FieldMetadata>[] =
  [
    {
      fieldId: 'displayName',
      label: 'People',
      Icon: IconUser,
      size: 210,
      position: 0,
      type: 'double-text-chip',
      metadata: {
        firstValueFieldName: 'firstName',
        secondValueFieldName: 'lastName',
        firstValuePlaceholder: 'F​irst n​ame', // Hack: Fake character to prevent password-manager from filling the field
        secondValuePlaceholder: 'L​ast n​ame', // Hack: Fake character to prevent password-manager from filling the field
        avatarUrlFieldName: 'avatarUrl',
        entityType: Entity.Person,
      },
      infoTooltipContent: 'Contact’s first and last name.',
      basePathToShowPage: '/person/',
    } satisfies ColumnDefinition<FieldDoubleTextChipMetadata>,
    {
      fieldId: 'email',
      label: 'Email',
      Icon: IconMail,
      size: 150,
      type: 'email',
      position: 1,
      metadata: {
        fieldName: 'email',
        placeHolder: 'Ema​il', // Hack: Fake character to prevent password-manager from filling the field
      },
      infoTooltipContent: 'Contact’s Email.',
    } satisfies ColumnDefinition<FieldEmailMetadata>,
    {
      fieldId: 'company',
      label: 'Company',
      Icon: IconBuildingSkyscraper,
      size: 150,
      position: 2,
      type: 'relation',
      metadata: {
        fieldName: 'company',
        relationType: Entity.Company,
      },
      infoTooltipContent: 'Contact’s company.',
      entityChipDisplayMapper: (dataObject: Company) => {
        return {
          name: dataObject?.name,
          pictureUrl: getLogoUrlFromDomainName(dataObject?.domainName),
          avatarType: 'squared',
        };
      },
    } satisfies ColumnDefinition<FieldRelationMetadata>,
    {
      fieldId: 'phone',
      label: 'Phone',
      Icon: IconPhone,
      size: 150,
      position: 3,
      type: 'phone',
      metadata: {
        fieldName: 'phone',
        placeHolder: 'Phon​e', // Hack: Fake character to prevent password-manager from filling the field
      },
      infoTooltipContent: 'Contact’s phone number.',
    } satisfies ColumnDefinition<FieldPhoneMetadata>,
    {
      fieldId: 'createdAt',
      label: 'Creation',
      Icon: IconCalendarEvent,
      size: 150,
      position: 4,
      type: 'date',
      metadata: {
        fieldName: 'createdAt',
      },
      infoTooltipContent: 'Date when the contact was added.',
    } satisfies ColumnDefinition<FieldDateMetadata>,
    {
      fieldId: 'city',
      label: 'City',
      Icon: IconMap,
      size: 150,
      position: 5,
      type: 'text',
      metadata: {
        fieldName: 'city',
        placeHolder: 'Cit​y', // Hack: Fake character to prevent password-manager from filling the field
      },
      infoTooltipContent: 'Contact’s city.',
    } satisfies ColumnDefinition<FieldTextMetadata>,
    {
      fieldId: 'jobTitle',
      label: 'Job title',
      Icon: IconBriefcase,
      size: 150,
      position: 6,
      type: 'text',
      metadata: {
        fieldName: 'jobTitle',
        placeHolder: 'Job title',
      },
      infoTooltipContent: 'Contact’s job title.',
    } satisfies ColumnDefinition<FieldTextMetadata>,
    {
      fieldId: 'linkedin',
      label: 'LinkedIn',
      Icon: IconBrandLinkedin,
      size: 150,
      position: 7,
      type: 'url',
      metadata: {
        fieldName: 'linkedinUrl',
        placeHolder: 'LinkedIn',
      },
      infoTooltipContent: 'Contact’s Linkedin account.',
    } satisfies ColumnDefinition<FieldURLMetadata>,
    {
      fieldId: 'x',
      label: 'Twitter',
      Icon: IconBrandX,
      size: 150,
      position: 8,
      type: 'url',
      metadata: {
        fieldName: 'xUrl',
        placeHolder: 'X',
      },
      infoTooltipContent: 'Contact’s Twitter account.',
    } satisfies ColumnDefinition<FieldURLMetadata>,
  ];
