import { defineObject, FieldType } from 'twenty-sdk/define';

export const SESSION_OPERATION_OBJECT_IDENTIFIER =
  'e7c841ae-02d9-4f8d-8c7a-1f82bce48152';
export const SESSION_OPERATION_KEY_IDENTIFIER =
  '7caee520-b355-48a6-ab80-d0f70c1696b3';

export default defineObject({
  universalIdentifier: SESSION_OPERATION_OBJECT_IDENTIFIER,
  nameSingular: 'studioSessionOperation',
  namePlural: 'studioSessionOperations',
  labelSingular: 'Операция занятия',
  labelPlural: 'Операции занятий',
  description: 'Журнал согласованных изменений занятия',
  icon: 'IconListDetails',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SESSION_OPERATION_KEY_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SESSION_OPERATION_KEY_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'operationKey',
      label: 'Ключ операции',
      icon: 'IconKey',
    },
    {
      universalIdentifier: '4c31c179-0157-4c52-87b7-0165162cd27f',
      type: FieldType.TEXT,
      name: 'classSessionId',
      label: 'ID занятия',
      icon: 'IconId',
    },
    {
      universalIdentifier: 'a5d0a46b-7130-463b-9063-46dbfe01adf8',
      type: FieldType.TEXT,
      name: 'request',
      label: 'Исходная команда',
      icon: 'IconCode',
    },
    {
      universalIdentifier: '45a709bc-2f6a-426c-a752-e37fd03ce8ad',
      type: FieldType.TEXT,
      name: 'ownerToken',
      label: 'Владелец выполнения',
      icon: 'IconKey',
      isNullable: true,
    },
    {
      universalIdentifier: 'eabf1c63-a337-4109-950f-263e08687009',
      type: FieldType.TEXT,
      name: 'result',
      label: 'Подтверждённый результат',
      icon: 'IconCode',
      isNullable: true,
    },
    {
      universalIdentifier: '232f28b6-a10e-4115-a602-d16e70f69297',
      type: FieldType.SELECT,
      name: 'state',
      label: 'Состояние исполнения',
      icon: 'IconProgress',
      defaultValue: "'PREPARED'",
      options: [
        {
          id: '018d5d8c-9c4b-4abe-b122-d3a9a081271c',
          value: 'PREPARED',
          label: 'Подготовлено',
          position: 0,
          color: 'gray',
        },
        {
          id: 'c66fcc75-2863-452e-8082-b0978c6113c4',
          value: 'CLAIMED',
          label: 'Захвачено',
          position: 1,
          color: 'blue',
        },
        {
          id: 'c40d98d9-295a-4d14-bd96-eb7a42315689',
          value: 'EXECUTING',
          label: 'Выполняется',
          position: 2,
          color: 'orange',
        },
        {
          id: '8a142f12-b42f-48ea-af02-56e3c5731dc0',
          value: 'SUCCEEDED',
          label: 'Подтверждено',
          position: 3,
          color: 'green',
        },
        {
          id: 'f506f086-cf37-48d9-b6e8-df2c591738e7',
          value: 'NEEDS_REVIEW',
          label: 'Требует разбора',
          position: 4,
          color: 'red',
        },
        {
          id: '51a603c5-ee4d-4e98-a2e7-4694c3876ab5',
          value: 'REJECTED',
          label: 'Отклонено без изменений',
          position: 5,
          color: 'gray',
        },
      ],
    },
  ],
});
