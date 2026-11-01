import { defineObject, FieldType } from 'twenty-sdk/define';
import { RUSSIAN_RUBLE_DEFAULT_VALUE } from 'src/constants/currency';

export const TRAINER_PAY_ENTRY_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'e4cd0e6c-d14d-42b6-8e54-80c060df111f';
export const TRAINER_PAY_ENTRY_OPERATION_KEY_FIELD_UNIVERSAL_IDENTIFIER =
  '086fb00f-3769-4f0c-ba54-806847271b80';
export const TRAINER_PAY_ENTRY_REVISION_FIELD_UNIVERSAL_IDENTIFIER =
  '077d93d4-b7a4-489e-8b87-40ed591cdeee';
export const TRAINER_PAY_ENTRY_ENTRY_TYPE_FIELD_UNIVERSAL_IDENTIFIER =
  '251520f9-b092-4f61-8b80-93caa2c8fa0d';
export const TRAINER_PAY_ENTRY_STATE_FIELD_UNIVERSAL_IDENTIFIER =
  'e78b34fb-5152-42bf-85b0-a4328ec12855';
export const TRAINER_PAY_ENTRY_AMOUNT_FIELD_UNIVERSAL_IDENTIFIER =
  'c61de934-7da8-40c8-8a1f-1a0490ee9231';
export const TRAINER_PAY_ENTRY_PARTICIPANT_COUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '6ac152d8-6802-4c4c-834f-6bc933e122a5';
export const TRAINER_PAY_ENTRY_SESSION_STARTS_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '9ff879c6-dae1-4047-bd4a-1edd5771a42d';
export const TRAINER_PAY_ENTRY_RECORDED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'b3836b74-4d91-4e92-a4fd-676d8c9abdc4';
export const TRAINER_PAY_ENTRY_RECORDED_BY_FIELD_UNIVERSAL_IDENTIFIER =
  '5d7b6748-f946-41ef-b021-caadab76ff33';
export const TRAINER_PAY_ENTRY_REASON_FIELD_UNIVERSAL_IDENTIFIER =
  'acdceebc-07cb-4ce7-b204-23e986e2f120';
export const TRAINER_PAY_ENTRY_REQUEST_KEY_FIELD_UNIVERSAL_IDENTIFIER =
  'cb2fe2f0-6072-4b1d-8719-be52e8b0860a';
export const TRAINER_PAY_ENTRY_PREVIOUS_ENTRY_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '61fe9ab5-61de-4122-834c-f13bfff398c7';
export const TRAINER_PAY_ENTRY_SNAPSHOT_FIELD_UNIVERSAL_IDENTIFIER =
  '5e78e31e-4cf8-457e-be2f-fc85adbeeede';
export const TRAINER_PAY_ENTRY_PREVIEW_TOKEN_FIELD_UNIVERSAL_IDENTIFIER =
  '20295430-1e8a-4c37-93e0-2c76b19d192b';
export const TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER =
  '86ae03b4-fb5b-4e22-8635-d26d0ceafa96';

export default defineObject({
  universalIdentifier: TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER,
  isUICreatable: false,
  isUIEditable: false,
  nameSingular: 'trainerPayEntry',
  namePlural: 'trainerPayEntries',
  labelSingular: 'Начисление тренеру',
  labelPlural: 'Начисления тренерам',
  icon: 'IconCash',
  labelIdentifierFieldMetadataUniversalIdentifier:
    TRAINER_PAY_ENTRY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: 'e4cd0e6c-d14d-42b6-8e54-80c060df111f',
      name: 'name',
      label: 'Название',
      type: FieldType.TEXT,
      icon: 'IconAbc',
    },
    {
      universalIdentifier: '086fb00f-3769-4f0c-ba54-806847271b80',
      name: 'operationKey',
      label: 'Ключ операции',
      type: FieldType.TEXT,
      icon: 'IconKey',
    },
    {
      universalIdentifier: '077d93d4-b7a4-489e-8b87-40ed591cdeee',
      name: 'revision',
      label: 'Ревизия',
      type: FieldType.NUMBER,
      icon: 'IconAbc',
    },
    {
      universalIdentifier: '251520f9-b092-4f61-8b80-93caa2c8fa0d',
      name: 'entryType',
      label: 'Операция',
      type: FieldType.SELECT,
      icon: 'IconArrowsExchange',
      options: [
        {
          id: '107a8046-66d9-4d8e-b287-83aa733edb8d',
          value: 'ACCRUAL',
          label: 'Начисление',
          position: 0,
          color: 'blue',
        },
        {
          id: 'c3d30900-0775-4960-9f58-4cb5bbe2d3bd',
          value: 'REVERSAL',
          label: 'Сторно',
          position: 1,
          color: 'blue',
        },
      ],
    },
    {
      universalIdentifier: 'e78b34fb-5152-42bf-85b0-a4328ec12855',
      name: 'state',
      label: 'Состояние',
      type: FieldType.SELECT,
      icon: 'IconProgress',
      options: [
        {
          id: 'a07a69ec-928e-49b0-8869-0bdd0738d69b',
          value: 'PENDING',
          label: 'Завершается',
          position: 0,
          color: 'blue',
        },
        {
          id: '17f4b027-2bd4-4cc4-a8a0-6ddc91e0a45e',
          value: 'POSTED',
          label: 'Проведено',
          position: 1,
          color: 'blue',
        },
      ],
    },
    {
      universalIdentifier: 'c61de934-7da8-40c8-8a1f-1a0490ee9231',
      name: 'amount',
      label: 'Сумма',
      type: FieldType.CURRENCY,
      icon: 'IconCash',
      defaultValue: RUSSIAN_RUBLE_DEFAULT_VALUE,
    },
    {
      universalIdentifier: '6ac152d8-6802-4c4c-834f-6bc933e122a5',
      name: 'participantCount',
      label: 'Посетило',
      type: FieldType.NUMBER,
      icon: 'IconUsers',
    },
    {
      universalIdentifier: '9ff879c6-dae1-4047-bd4a-1edd5771a42d',
      name: 'sessionStartsAt',
      label: 'Дата занятия',
      type: FieldType.DATE_TIME,
      icon: 'IconCalendarClock',
    },
    {
      universalIdentifier: 'b3836b74-4d91-4e92-a4fd-676d8c9abdc4',
      name: 'recordedAt',
      label: 'Внесено',
      type: FieldType.DATE_TIME,
      icon: 'IconCalendarClock',
    },
    {
      universalIdentifier: '5d7b6748-f946-41ef-b021-caadab76ff33',
      name: 'recordedBy',
      label: 'Автор',
      type: FieldType.TEXT,
      icon: 'IconUsers',
      isNullable: true,
    },
    {
      universalIdentifier: 'acdceebc-07cb-4ce7-b204-23e986e2f120',
      name: 'reason',
      label: 'Основание',
      type: FieldType.TEXT,
      icon: 'IconNote',
    },
    {
      universalIdentifier: 'cb2fe2f0-6072-4b1d-8719-be52e8b0860a',
      name: 'requestKey',
      label: 'Ключ запроса',
      type: FieldType.TEXT,
      icon: 'IconKey',
    },
    {
      universalIdentifier: '61fe9ab5-61de-4122-834c-f13bfff398c7',
      name: 'previousEntryId',
      label: 'Исходное начисление',
      type: FieldType.TEXT,
      icon: 'IconId',
      isNullable: true,
    },
    {
      universalIdentifier: '5e78e31e-4cf8-457e-be2f-fc85adbeeede',
      name: 'snapshot',
      label: 'Полный снимок расчёта',
      type: FieldType.TEXT,
      icon: 'IconCode',
    },
    {
      universalIdentifier: '20295430-1e8a-4c37-93e0-2c76b19d192b',
      name: 'previewToken',
      label: 'Подтверждённый расчёт',
      type: FieldType.TEXT,
      icon: 'IconCode',
    },
  ],
});
