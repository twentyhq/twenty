import {
  IconCalendarEvent,
  IconCalendarTime,
  IconCheck,
  IconCoins,
  IconComponent,
  IconCreativeCommonsSa,
  IconFilePencil,
  IconJson,
  IconKey,
  IconLink,
  IconMail,
  IconMap,
  IconNumbers,
  IconPhone,
  IconRelationManyToMany,
  IconTag,
  IconTags,
  IconTextSize,
  IconTwentyStar,
  IconUser,
} from 'twenty-ui';

import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { DEFAULT_DATE_VALUE } from '@/settings/data-model/constants/DefaultDateValue';
import { SettingsFieldTypeCategoryType } from '@/settings/data-model/types/SettingsFieldTypeCategoryType';
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

DEFAULT_DATE_VALUE.setFullYear(DEFAULT_DATE_VALUE.getFullYear() + 2);

export type SettingsFieldTypeConfig = {
  label: string;
  Icon: IconComponent;
  exampleValue?: unknown;
  category: SettingsFieldTypeCategoryType;
};

export const SETTINGS_FIELD_TYPE_CONFIGS = {
  [FieldMetadataType.Uuid]: {
    label: 'Unique ID',
    Icon: IconKey,
    exampleValue: '00000000-0000-0000-0000-000000000000',
    category: 'Advanced',
  },
  [FieldMetadataType.Text]: {
    label: 'Texto',
    Icon: IconTextSize,
    exampleValue:
      'Exemplo de texto para o campo de tipo Texto. Pode conter uma descrição ou um parágrafo qualquer.',
    category: 'Basic',
  },
  [FieldMetadataType.Numeric]: {
    label: 'Numérico',
    Icon: IconNumbers,
    exampleValue: 2000,
    category: 'Basic',
  },
  [FieldMetadataType.Number]: {
    label: 'Número',
    Icon: IconNumbers,
    exampleValue: 2000,
    category: 'Basic',
  },
  [FieldMetadataType.Link]: {
    label: 'Link',
    Icon: IconLink,
    exampleValue: { url: 'www.example.com', label: '' },
    category: 'Basic',
  },
  [FieldMetadataType.Links]: {
    label: 'Links',
    Icon: IconLink,
    exampleValue: { primaryLinkUrl: 'example.com', primaryLinkLabel: '' },
    category: 'Basic',
  },
  [FieldMetadataType.Boolean]: {
    label: 'Verdadeiro/Falso',
    Icon: IconCheck,
    exampleValue: true,
    category: 'Basic',
  },
  [FieldMetadataType.DateTime]: {
    label: 'Data e Hora',
    Icon: IconCalendarTime,
    exampleValue: DEFAULT_DATE_VALUE.toISOString(),
    category: 'Basic',
  },
  [FieldMetadataType.Date]: {
    label: 'Data',
    Icon: IconCalendarEvent,
    exampleValue: DEFAULT_DATE_VALUE.toISOString(),
    category: 'Basic',
  },
  [FieldMetadataType.Select]: {
    label: 'Seleção',
    Icon: IconTag,
    category: 'Basic',
  },
  [FieldMetadataType.MultiSelect]: {
    label: 'Seleção Múltipla',
    Icon: IconTags,
    category: 'Basic',
  },
  [FieldMetadataType.Currency]: {
    label: 'Moeda',
    Icon: IconCoins,
    exampleValue: { amountMicros: 2000000000, currencyCode: CurrencyCode.BRL },
    category: 'Basic',
  },
  [FieldMetadataType.Relation]: {
    label: 'Relação',
    Icon: IconRelationManyToMany,
    category: 'Relation',
  },
  [FieldMetadataType.Email]: {
    label: 'Email',
    Icon: IconMail,
    category: 'Basic',
  },
  [FieldMetadataType.Emails]: {
    label: 'Emails',
    Icon: IconMail,
    exampleValue: { primaryEmail: 'joao@acme.com' },
    category: 'Basic',
  },
  [FieldMetadataType.Phone]: {
    label: 'Telefone',
    Icon: IconPhone,
    exampleValue: '+55 11 1234-5678',
    category: 'Basic',
  },
  [FieldMetadataType.Rating]: {
    label: 'Avaliação',
    Icon: IconTwentyStar,
    exampleValue: '3',
    category: 'Basic',
  },
  [FieldMetadataType.FullName]: {
    label: 'Nome Completo',
    Icon: IconUser,
    exampleValue: { firstName: 'João', lastName: 'Silva' },
    category: 'Advanced',
  },
  [FieldMetadataType.Address]: {
    label: 'Endereço',
    Icon: IconMap,
    exampleValue: {
      addressStreet1: 'Rua dos Pinheiros, 123',
      addressStreet2: 'Apto 12B',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressCountry: 'Brasil',
      addressPostcode: '05422012',
      addressLat: -23.561684,
      addressLng: -46.655981,
    },
    category: 'Basic',
  },
  [FieldMetadataType.RawJson]: {
    label: 'JSON',
    Icon: IconJson,
    exampleValue: { key: 'value' },

    category: 'Basic',
  },
  [FieldMetadataType.RichText]: {
    label: 'Rich Text',
    Icon: IconFilePencil,
    exampleValue: { key: 'value' },
    category: 'Basic',
  },
  [FieldMetadataType.Actor]: {
    label: 'Ator',
    Icon: IconCreativeCommonsSa,
    category: 'Basic',
  },
} as const satisfies Record<
  SettingsSupportedFieldType,
  SettingsFieldTypeConfig
>;
