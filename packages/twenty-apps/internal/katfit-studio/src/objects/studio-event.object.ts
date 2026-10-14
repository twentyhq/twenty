import { defineObject, FieldType } from 'twenty-sdk/define';

export const STUDIO_EVENT_OBJECT_UNIVERSAL_IDENTIFIER = '1db750d9-2a37-4f78-9ea3-00d91704b66f';
export const STUDIO_EVENT_NAME_FIELD_UNIVERSAL_IDENTIFIER = '138d1905-2731-4cbd-9cfb-f0fd7eb8e1ee';

export default defineObject({
  universalIdentifier: STUDIO_EVENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'studioEvent', namePlural: 'studioEvents',
  labelSingular: 'Событие студии', labelPlural: 'Журнал событий студии',
  description: 'Неизменяемый журнал выполнения операций студии', icon: 'IconHistory',
  labelIdentifierFieldMetadataUniversalIdentifier: STUDIO_EVENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: STUDIO_EVENT_NAME_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'name', label: 'Событие', icon: 'IconAbc' },
    { universalIdentifier: 'e915315e-bbd1-42dc-b89a-d1555e850924', type: FieldType.SELECT, name: 'eventType', label: 'Действие', icon: 'IconActivity', options: [
      { id: '3e75c6eb-7c18-4a40-92d2-51caa3d3d84e', value: 'BOOKING_CREATED', label: 'Запись создана', position: 0, color: 'green' },
      { id: 'd7d34801-4157-49bc-ae2f-f40a6fa253dc', value: 'BOOKING_CANCELLED', label: 'Запись отменена', position: 1, color: 'orange' },
      { id: 'a8f30fb4-8e7b-458b-9ec5-bf908c9af3c4', value: 'OPERATION_FAILED', label: 'Операция не выполнена', position: 2, color: 'red' },
      { id: 'd0032b3d-57d4-4d79-bec2-a04144a69fb3', value: 'SESSION_CREATED', label: 'Занятие создано', position: 3, color: 'blue' },
      { id: 'e0dbda76-bbed-4327-8802-ea3b3adcf60f', value: 'PAYMENT_CONFIRMED', label: 'Оплата подтверждена', position: 4, color: 'green' },
      { id: 'b7d3a63b-c8c2-45a3-bf02-2c18cd3b8ab0', value: 'CLIENT_CREATED', label: 'Клиент добавлен', position: 5, color: 'green' },
    ] },
    { universalIdentifier: '5219f42b-d8c2-4309-a580-c11c3691665f', type: FieldType.SELECT, name: 'outcome', label: 'Результат', icon: 'IconProgress', options: [
      { id: 'f5ff5e75-8592-4430-a43e-8fcf3edf27e5', value: 'SUCCESS', label: 'Успешно', position: 0, color: 'green' },
      { id: '5a124b12-08fa-4e51-adc1-5beb7c1ced12', value: 'FAILURE', label: 'Ошибка', position: 1, color: 'red' },
    ] },
    { universalIdentifier: 'e0e3b690-7e05-4fe1-9220-88986146be0f', type: FieldType.DATE_TIME, name: 'occurredAt', label: 'Время', icon: 'IconCalendarClock' },
    { universalIdentifier: '5a304048-a94b-4ebd-a1c2-9db9000a298a', type: FieldType.TEXT, name: 'idempotencyKey', label: 'Ключ операции', icon: 'IconKey', isNullable: true },
    { universalIdentifier: '45609144-e4ea-413d-a88c-1198aa8710f1', type: FieldType.TEXT, name: 'bookingId', label: 'ID записи', icon: 'IconId', isNullable: true },
    { universalIdentifier: '1db2c928-6e53-4c19-b703-bffcc0ad6dfd', type: FieldType.TEXT, name: 'membershipId', label: 'ID пакета', icon: 'IconId', isNullable: true },
    { universalIdentifier: '6db571c4-604a-474d-9b81-7a4aef71ecb4', type: FieldType.TEXT, name: 'classSessionId', label: 'ID занятия', icon: 'IconId', isNullable: true },
    { universalIdentifier: '9b23c9d9-283d-411f-9cb1-6238de46f7eb', type: FieldType.TEXT, name: 'details', label: 'Детали', icon: 'IconNote', isNullable: true },
  ],
});
