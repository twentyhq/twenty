import { ColumnDefinition } from '@/ui/data-table/types/ColumnDefinition';
import {
  FieldDateMetadata,
  FieldDoubleTextChipMetadata,
  FieldEmailMetadata,
  FieldMetadata,
  FieldPhoneMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
} from '@/ui/field/types/FieldMetadata';
import {
  IconArrowUpRight,
  IconBrandLinkedin,
  IconBrandX,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPencil,
  IconPhone,
  IconUser,
} from '@/ui/icon/index';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { Company } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

export const peopleAvailableColumnDefinitions: ColumnDefinition<FieldMetadata>[] =
  [
    {
      key: 'displayName',
      name: 'People',
      Icon: IconUser,
      size: 210,
      index: 0,
      type: 'double-text-chip',
      metadata: {
        firstValueFieldName: 'firstName',
        secondValueFieldName: 'lastName',
        firstValuePlaceholder: 'F​irst n​ame', // Hack: Fake character to prevent password-manager from filling the field
        secondValuePlaceholder: 'L​ast n​ame', // Hack: Fake character to prevent password-manager from filling the field
        avatarUrlFieldName: 'avatarUrl',
        entityType: Entity.Person,
      },
      buttonIcon: IconArrowUpRight,
      infoTooltipContent: 'Contact’s first and last name.',
      basePathToShowPage: '/person/',
    } satisfies ColumnDefinition<FieldDoubleTextChipMetadata>,
    {
      key: 'email',
      name: 'Email',
      Icon: IconMail,
      size: 150,
      type: 'email',
      index: 1,
      metadata: {
        fieldName: 'email',
        placeHolder: 'Ema​il', // Hack: Fake character to prevent password-manager from filling the field
      },
      buttonIcon: IconPencil,
      infoTooltipContent: 'Contact’s Email.',
    } satisfies ColumnDefinition<FieldEmailMetadata>,
    {
      key: 'company',
      name: 'Company',
      Icon: IconBuildingSkyscraper,
      size: 150,
      index: 2,
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
      key: 'phone',
      name: 'Phone',
      Icon: IconPhone,
      size: 150,
      index: 3,
      type: 'phone',
      metadata: {
        fieldName: 'phone',
        placeHolder: 'Phon​e', // Hack: Fake character to prevent password-manager from filling the field
      },
      buttonIcon: IconPencil,
      infoTooltipContent: 'Contact’s phone number.',
    } satisfies ColumnDefinition<FieldPhoneMetadata>,
    {
      key: 'createdAt',
      name: 'Creation',
      Icon: IconCalendarEvent,
      size: 150,
      index: 4,
      type: 'date',
      metadata: {
        fieldName: 'createdAt',
      },
      infoTooltipContent: 'Date when the contact was added.',
    } satisfies ColumnDefinition<FieldDateMetadata>,
    {
      key: 'city',
      name: 'City',
      Icon: IconMap,
      size: 150,
      index: 5,
      type: 'text',
      metadata: {
        fieldName: 'city',
        placeHolder: 'Cit​y', // Hack: Fake character to prevent password-manager from filling the field
      },
      infoTooltipContent: 'Contact’s city.',
    } satisfies ColumnDefinition<FieldTextMetadata>,
    {
      key: 'jobTitle',
      name: 'Job title',
      Icon: IconBriefcase,
      size: 150,
      index: 6,
      type: 'text',
      metadata: {
        fieldName: 'jobTitle',
        placeHolder: 'Job title',
      },
      infoTooltipContent: 'Contact’s job title.',
    } satisfies ColumnDefinition<FieldTextMetadata>,
    {
      key: 'linkedin',
      name: 'LinkedIn',
      Icon: IconBrandLinkedin,
      size: 150,
      index: 7,
      type: 'url',
      metadata: {
        fieldName: 'linkedinUrl',
        placeHolder: 'LinkedIn',
      },
      buttonIcon: IconPencil,
      infoTooltipContent: 'Contact’s Linkedin account.',
    } satisfies ColumnDefinition<FieldURLMetadata>,
    {
      key: 'x',
      name: 'Twitter',
      Icon: IconBrandX,
      size: 150,
      index: 8,
      type: 'url',
      metadata: {
        fieldName: 'xUrl',
        placeHolder: 'X',
      },
      buttonIcon: IconPencil,
      infoTooltipContent: 'Contact’s Twitter account.',
    } satisfies ColumnDefinition<FieldURLMetadata>,
  ];
