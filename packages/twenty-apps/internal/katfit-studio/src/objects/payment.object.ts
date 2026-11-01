import { defineObject, FieldType } from 'twenty-sdk/define';

import { RUSSIAN_RUBLE_DEFAULT_VALUE } from 'src/constants/currency';

export const PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER =
  '0b5b7732-e33e-4b0f-85df-4d51b1da3f97';
export const PAYMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'b7b6f07e-d277-4429-ae96-d72cc42a0f7f';

export default defineObject({
  universalIdentifier: PAYMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'studioPayment',
  namePlural: 'studioPayments',
  labelSingular: 'Оплата',
  labelPlural: 'Оплаты',
  description: 'Управленческий реестр оплат и возвратов',
  icon: 'IconCash',
  labelIdentifierFieldMetadataUniversalIdentifier:
    PAYMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: '5247e6f5-1259-41b4-ab6c-c5a1dd3d14fe',
      type: FieldType.TEXT,
      name: 'sessionPaymentContext',
      label: 'Параметры разовой тренировки',
      icon: 'IconCalendar',
      isNullable: true,
    },
    {
      universalIdentifier: PAYMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Название',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: '46246b5f-f5c3-4493-b1ae-e3ae959ae0fa',
      type: FieldType.CURRENCY,
      name: 'amount',
      label: 'Сумма',
      icon: 'IconCurrencyRubel',
      defaultValue: RUSSIAN_RUBLE_DEFAULT_VALUE,
    },
    {
      universalIdentifier: 'a47842a4-ce1a-4ce3-9a62-ec06f45437c6',
      type: FieldType.SELECT,
      name: 'paymentMethod',
      label: 'Способ оплаты',
      icon: 'IconCreditCard',
      options: [
        {
          id: '35935894-c4f9-450a-970e-24e72372a445',
          value: 'CASH',
          label: 'Наличные',
          position: 0,
          color: 'green',
        },
        {
          id: '0980b30c-0ff7-41a8-87ba-7d032b0483d4',
          value: 'SBP',
          label: 'СБП',
          position: 1,
          color: 'blue',
        },
        {
          id: 'a84365ab-e69e-4bc1-88ce-fe33105cbeaf',
          value: 'CARD',
          label: 'Карта',
          position: 2,
          color: 'purple',
        },
      ],
    },
    {
      universalIdentifier: 'e019e1bc-c0ea-4224-8d71-977052d2ac43',
      type: FieldType.SELECT,
      name: 'status',
      label: 'Статус',
      icon: 'IconProgress',
      defaultValue: "'EXPECTED'",
      options: [
        {
          id: '6f8ad3e6-d467-44c2-ab02-edc6244933f9',
          value: 'EXPECTED',
          label: 'Ожидается',
          position: 0,
          color: 'gray',
        },
        {
          id: 'de893ce4-44c5-454f-b1b8-09bb7fab5c47',
          value: 'PAID',
          label: 'Оплачено',
          position: 1,
          color: 'green',
        },
        {
          id: 'ad6959db-2723-4ff9-8da4-cda0edb1f3fa',
          value: 'PARTIALLY_REFUNDED',
          label: 'Частичный возврат',
          position: 2,
          color: 'yellow',
        },
        {
          id: '096f31d8-a08c-425b-a454-780e75dcadd8',
          value: 'REFUNDED',
          label: 'Возвращено',
          position: 3,
          color: 'orange',
        },
        {
          id: '2b028b5a-8723-4821-a7ca-6996bfba5be1',
          value: 'FAILED',
          label: 'Ошибка',
          position: 4,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier: '2cbc3b0b-fe03-4c54-b25e-68212c6a33e7',
      type: FieldType.DATE_TIME,
      name: 'paidAt',
      label: 'Оплачено',
      icon: 'IconCalendarDollar',
      isNullable: true,
    },
    {
      universalIdentifier: '6efcb8b6-fd35-412b-98d4-08337e9b82a3',
      type: FieldType.TEXT,
      name: 'fiscalReceiptId',
      label: 'ID чека',
      icon: 'IconReceipt',
      isNullable: true,
    },
    {
      universalIdentifier: 'b4b9875b-1c17-4211-9928-e0bc063e6465',
      type: FieldType.TEXT,
      name: 'externalId',
      label: 'Внешний ID',
      icon: 'IconId',
      isNullable: true,
    },
    {
      universalIdentifier: '6c1c56f7-6756-4730-9969-d1402f4a9a3d',
      type: FieldType.TEXT,
      name: 'idempotencyKey',
      label: 'Ключ операции',
      icon: 'IconKey',
      isNullable: true,
    },
    {
      universalIdentifier: '90d83f4f-ea49-4f30-bb69-4978fe5eb4d3',
      type: FieldType.CURRENCY,
      name: 'refundAmount',
      label: 'Сумма возврата',
      icon: 'IconCashBanknoteOff',
      isNullable: true,
      defaultValue: RUSSIAN_RUBLE_DEFAULT_VALUE,
    },
  ],
});
