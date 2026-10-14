import { defineObject, FieldType } from 'twenty-sdk/define';

export const MEMBERSHIP_TRANSACTION_OBJECT_UNIVERSAL_IDENTIFIER =
  'dd298f23-ed65-4eb9-85bf-506a8ee0988b';
export const MEMBERSHIP_TRANSACTION_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '389ed7d5-6102-41cb-9dd1-ef93001dff16';
export const MEMBERSHIP_TRANSACTION_TYPE_FIELD_UNIVERSAL_IDENTIFIER =
  'f5625c4a-f3e8-424f-856e-cb0e065e0ded';

export default defineObject({
  universalIdentifier: MEMBERSHIP_TRANSACTION_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'membershipTransaction',
  namePlural: 'membershipTransactions',
  labelSingular: 'Операция пакета',
  labelPlural: 'Операции пакетов',
  description: 'Неизменяемый журнал начислений и списаний',
  icon: 'IconListDetails',
  labelIdentifierFieldMetadataUniversalIdentifier:
    MEMBERSHIP_TRANSACTION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier:
        MEMBERSHIP_TRANSACTION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Название',
      icon: 'IconAbc',
    },
    {
      universalIdentifier:
        MEMBERSHIP_TRANSACTION_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'transactionType',
      label: 'Операция',
      icon: 'IconArrowsExchange',
      options: [
        {
          id: '620eb0b3-b2e9-412d-b9da-e146409d91a0',
          value: 'GRANT',
          label: 'Начисление',
          position: 0,
          color: 'green',
        },
        {
          id: '29a29456-1ce3-4286-a934-b0c7dfc7417e',
          value: 'RESERVE',
          label: 'Резерв',
          position: 1,
          color: 'blue',
        },
        {
          id: '2b9b7dbe-04f6-4f29-af2d-2b9740b7985e',
          value: 'RELEASE',
          label: 'Освобождение',
          position: 2,
          color: 'sky',
        },
        {
          id: '9b68c789-8f57-42cd-a33b-7593dc4582ac',
          value: 'CONSUME',
          label: 'Списание',
          position: 3,
          color: 'orange',
        },
        {
          id: '6da0d035-c899-43d6-a6e7-1455e523e617',
          value: 'ADJUST',
          label: 'Корректировка',
          position: 4,
          color: 'purple',
        },
        {
          id: '9beb4809-710b-45b2-93d6-78994dac51dd',
          value: 'REFUND_VISIT',
          label: 'Возврат посещения',
          position: 5,
          color: 'yellow',
        },
        {
          id: 'af64a0d4-1971-40cd-ad90-7280444fc460',
          value: 'EXTEND',
          label: 'Продление',
          position: 6,
          color: 'pink',
        },
      ],
    },
    {
      universalIdentifier: 'e49686da-ad4f-420f-be23-4be94a62a183',
      type: FieldType.NUMBER,
      name: 'visitDelta',
      label: 'Изменение посещений',
      icon: 'IconPlusMinus',
      defaultValue: 0,
    },
    {
      universalIdentifier: '691612fd-b0f3-49c4-ab6f-b7dbc9f29786',
      type: FieldType.NUMBER,
      name: 'daysDelta',
      label: 'Изменение срока',
      icon: 'IconCalendarPlus',
      defaultValue: 0,
    },
    {
      universalIdentifier: '3ff66dc5-5cf4-4f95-8819-8a031a365200',
      type: FieldType.DATE_TIME,
      name: 'occurredAt',
      label: 'Время операции',
      icon: 'IconCalendarClock',
    },
    {
      universalIdentifier: 'b0d1983e-044a-4b73-bb1f-0c8b87c8afca',
      type: FieldType.TEXT,
      name: 'idempotencyKey',
      label: 'Ключ идемпотентности',
      icon: 'IconKey',
    },
    {
      universalIdentifier: '46c2b255-7b69-45d1-aa8c-6637374662bc',
      type: FieldType.TEXT,
      name: 'reason',
      label: 'Причина',
      icon: 'IconNote',
      isNullable: true,
    },
    {
      universalIdentifier: 'd9f6024d-93fc-4d80-9513-73ca92e61826',
      type: FieldType.NUMBER,
      name: 'consumptionSequence',
      label: 'Номер списания',
      icon: 'IconNumber',
      isNullable: true,
    },
  ],
});
