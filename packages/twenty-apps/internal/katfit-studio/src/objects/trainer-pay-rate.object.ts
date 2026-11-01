import { defineObject, FieldType } from 'twenty-sdk/define';
import { RUSSIAN_RUBLE_DEFAULT_VALUE } from 'src/constants/currency';

export const TRAINER_PAY_RATE_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '0eda940d-6012-4ffe-8bb0-2cad7406bf24';
export const TRAINER_PAY_RATE_VERSION_FIELD_UNIVERSAL_IDENTIFIER =
  'ed88e777-ae17-47a2-baa4-5627ffad4728';
export const TRAINER_PAY_RATE_SESSION_FORMAT_FIELD_UNIVERSAL_IDENTIFIER =
  '7d7f1249-ec85-4a9f-aec1-b60351debbdf';
export const TRAINER_PAY_RATE_AMOUNT_FOR1_FIELD_UNIVERSAL_IDENTIFIER =
  'f319d8b8-19ab-4cda-befa-1020b83f719d';
export const TRAINER_PAY_RATE_AMOUNT_FOR2_FIELD_UNIVERSAL_IDENTIFIER =
  '8e01fa6e-8c52-4f98-b8ad-7b448aa9cbd3';
export const TRAINER_PAY_RATE_AMOUNT_FOR3_FIELD_UNIVERSAL_IDENTIFIER =
  '6c4e07db-5a86-45f5-ae9c-9638e9f0cb72';
export const TRAINER_PAY_RATE_AMOUNT_FOR4_FIELD_UNIVERSAL_IDENTIFIER =
  'd90b2fe6-e6ba-4540-bb34-5308afe01363';
export const TRAINER_PAY_RATE_PUBLISHED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '514e8203-409a-475f-88c9-3257de5e4d71';
export const TRAINER_PAY_RATE_PUBLISHED_BY_FIELD_UNIVERSAL_IDENTIFIER =
  'd9969058-59d8-4a89-8abb-5f50fae36a43';
export const TRAINER_PAY_RATE_PUBLISHED_SNAPSHOT_FIELD_UNIVERSAL_IDENTIFIER =
  'ecd7b53f-3606-4226-9c83-74ae0ff2bbef';
export const TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER =
  'ab38fb91-48a0-4331-9e61-969c7be62c77';

export default defineObject({
  universalIdentifier: TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'trainerPayRate',
  namePlural: 'trainerPayRates',
  labelSingular: 'Тариф тренера',
  labelPlural: 'Тарифы тренеров',
  icon: 'IconSettings',
  labelIdentifierFieldMetadataUniversalIdentifier:
    TRAINER_PAY_RATE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: '0eda940d-6012-4ffe-8bb0-2cad7406bf24',
      name: 'name',
      label: 'Название',
      type: FieldType.TEXT,
      icon: 'IconAbc',
    },
    {
      universalIdentifier: 'ed88e777-ae17-47a2-baa4-5627ffad4728',
      name: 'version',
      label: 'Версия',
      type: FieldType.NUMBER,
      icon: 'IconNumber',
    },
    {
      universalIdentifier: '7d7f1249-ec85-4a9f-aec1-b60351debbdf',
      name: 'sessionFormat',
      label: 'Формат',
      type: FieldType.SELECT,
      icon: 'IconYoga',
      options: [
        {
          id: '60bc727a-3128-4608-ab25-dbdc40624f1c',
          value: 'GROUP_REFORMER',
          label: 'Группа на реформере',
          position: 0,
          color: 'blue',
        },
        {
          id: '7506caad-bd4b-453d-b554-13b5dfcecb7f',
          value: 'PERSONAL_EQUIPMENT',
          label: 'Персональное на оборудовании',
          position: 1,
          color: 'purple',
        },
      ],
    },
    {
      universalIdentifier: 'f319d8b8-19ab-4cda-befa-1020b83f719d',
      name: 'amountFor1',
      label: '1 участник, ₽',
      type: FieldType.CURRENCY,
      icon: 'IconCash',
      isNullable: true,
      defaultValue: RUSSIAN_RUBLE_DEFAULT_VALUE,
    },
    {
      universalIdentifier: '8e01fa6e-8c52-4f98-b8ad-7b448aa9cbd3',
      name: 'amountFor2',
      label: '2 участника, ₽',
      type: FieldType.CURRENCY,
      icon: 'IconCash',
      isNullable: true,
      defaultValue: RUSSIAN_RUBLE_DEFAULT_VALUE,
    },
    {
      universalIdentifier: '6c4e07db-5a86-45f5-ae9c-9638e9f0cb72',
      name: 'amountFor3',
      label: '3 участника, ₽',
      type: FieldType.CURRENCY,
      icon: 'IconCash',
      isNullable: true,
      defaultValue: RUSSIAN_RUBLE_DEFAULT_VALUE,
    },
    {
      universalIdentifier: 'd90b2fe6-e6ba-4540-bb34-5308afe01363',
      name: 'amountFor4',
      label: '4 участника, ₽',
      type: FieldType.CURRENCY,
      icon: 'IconCash',
      isNullable: true,
      defaultValue: RUSSIAN_RUBLE_DEFAULT_VALUE,
    },
    {
      universalIdentifier: '514e8203-409a-475f-88c9-3257de5e4d71',
      name: 'publishedAt',
      label: 'Опубликован',
      type: FieldType.DATE_TIME,
      icon: 'IconCalendarClock',
      isNullable: true,
    },
    {
      universalIdentifier: 'd9969058-59d8-4a89-8abb-5f50fae36a43',
      name: 'publishedBy',
      label: 'Автор публикации',
      type: FieldType.TEXT,
      icon: 'IconUsers',
      isNullable: true,
    },
    {
      universalIdentifier: 'ecd7b53f-3606-4226-9c83-74ae0ff2bbef',
      name: 'publishedSnapshot',
      label: 'Опубликованные условия',
      type: FieldType.TEXT,
      icon: 'IconCode',
      isNullable: true,
    },
  ],
});
