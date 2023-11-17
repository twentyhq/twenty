import {
  IconCalendarEvent,
  IconCheck,
  IconCoins,
  IconKey,
  IconLink,
  IconMail,
  IconNumbers,
  IconPhone,
  IconPlug,
  IconTextSize,
  IconUser,
} from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { CurrencyCode, FieldMetadataType } from '~/generated-metadata/graphql';

const defaultDateValue = new Date();
defaultDateValue.setFullYear(defaultDateValue.getFullYear() + 2);

export const dataTypes: Record<
  FieldMetadataType,
  { label: string; Icon: IconComponent; defaultValue?: unknown }
> = {
  [FieldMetadataType.Uuid]: {
    label: 'Unique ID',
    Icon: IconKey,
    defaultValue: '00000000-0000-0000-0000-000000000000',
  },
  [FieldMetadataType.Text]: {
    label: 'Text',
    Icon: IconTextSize,
    defaultValue:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
  },
  [FieldMetadataType.Number]: {
    label: 'Number',
    Icon: IconNumbers,
    defaultValue: 2000,
  },
  [FieldMetadataType.Link]: {
    label: 'Link',
    Icon: IconLink,
    defaultValue: { url: 'www.twenty.com', label: '' },
  },
  [FieldMetadataType.Boolean]: {
    label: 'True/False',
    Icon: IconCheck,
    defaultValue: true,
  },
  [FieldMetadataType.Date]: {
    label: 'Date',
    Icon: IconCalendarEvent,
    defaultValue: defaultDateValue.toISOString(),
  },
  [FieldMetadataType.Currency]: {
    label: 'Currency',
    Icon: IconCoins,
    defaultValue: { amount: 2000, currency: CurrencyCode.Usd },
  },
  [FieldMetadataType.Relation]: { label: 'Relation', Icon: IconPlug },
  [FieldMetadataType.Email]: { label: 'Email', Icon: IconMail },
  [FieldMetadataType.Phone]: { label: 'Phone', Icon: IconPhone },
  [FieldMetadataType.Probability]: {
    label: 'Probability',
    Icon: IconNumbers,
    defaultValue: 50,
  },
  [FieldMetadataType.FullName]: { label: 'Full Name', Icon: IconUser },
  [FieldMetadataType.Enum]: { label: 'Enum', Icon: IconPlug },
};
