import { defineObject, FieldType } from 'twenty-sdk/define';

import { RUSSIAN_RUBLE_DEFAULT_VALUE } from 'src/constants/currency';
import { SESSION_FORMAT_OPTIONS } from 'src/constants/select-options';

export const CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER = 'a7c3d8b4-8a67-483e-ae59-0af24b746110';
export const CLASS_SESSION_NAME_FIELD_UNIVERSAL_IDENTIFIER = 'a96259d1-dcae-455f-ae7c-cdcfd5e90f89';

export default defineObject({
  universalIdentifier: CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'classSession', namePlural: 'classSessions',
  labelSingular: 'Занятие', labelPlural: 'Занятия',
  description: 'Конкретный групповой или персональный слот', icon: 'IconCalendarEvent',
  labelIdentifierFieldMetadataUniversalIdentifier: CLASS_SESSION_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: 'b40aa498-854e-4997-a6fd-e70730668149', type: FieldType.TEXT, name: 'mutationLock', label: 'Владелец изменения занятия', icon: 'IconLock', isNullable: true },
    { universalIdentifier: CLASS_SESSION_NAME_FIELD_UNIVERSAL_IDENTIFIER, type: FieldType.TEXT, name: 'name', label: 'Название', icon: 'IconAbc' },
    { universalIdentifier: 'e5c7e882-7c28-4f25-8cbc-cf00561b3937', type: FieldType.SELECT, name: 'sessionFormat', label: 'Формат', icon: 'IconYoga', options: [...SESSION_FORMAT_OPTIONS] },
    { universalIdentifier: '37033f49-d77e-4127-901c-20ff00e951c3', type: FieldType.DATE_TIME, name: 'startsAt', label: 'Начало', icon: 'IconCalendarClock' },
    { universalIdentifier: '74a0452c-a84f-4528-9b70-da31fe870cac', type: FieldType.DATE_TIME, name: 'endsAt', label: 'Окончание', icon: 'IconCalendarTime' },
    { universalIdentifier: '8af0e99d-46d2-40a6-b742-67430453fb45', type: FieldType.NUMBER, name: 'capacity', label: 'Вместимость', icon: 'IconArmchair', defaultValue: 4 },
    {
      universalIdentifier: '81326384-2b7c-4213-955c-d83c923bfeb8', type: FieldType.SELECT, name: 'status', label: 'Статус', icon: 'IconProgress', defaultValue: "'PLANNED'",
      options: [
        { id: '45b68e53-e176-4adf-a210-a9217c7e9222', value: 'PLANNED', label: 'Запланировано', position: 0, color: 'gray' },
        { id: 'abbe2c26-75f0-438e-83c6-0d1b6445f5ae', value: 'CONFIRMED', label: 'Подтверждено', position: 1, color: 'blue' },
        { id: 'f46c29df-f657-4bc3-87b1-d22f9af0e754', value: 'COMPLETED', label: 'Проведено', position: 2, color: 'green' },
        { id: 'ab807b6a-c9bd-4e89-bd5a-7cd4b9fe8b75', value: 'CANCELLED_BY_STUDIO', label: 'Отменено студией', position: 3, color: 'red' },
      ],
    },
    { universalIdentifier: 'f7ec746a-e359-47ef-af98-670a2116e63b', type: FieldType.NUMBER, name: 'bookedCount', label: 'Забронировано', icon: 'IconUsers', defaultValue: 0 },
    { universalIdentifier: '30505af1-2755-471e-9c7b-195ed50e68d2', type: FieldType.NUMBER, name: 'attendedCount', label: 'Посетило', icon: 'IconUserCheck', defaultValue: 0 },
    { universalIdentifier: 'b1ac595a-5172-40ef-81bb-f4e26ca7981b', type: FieldType.CURRENCY, name: 'trainerCompensation', label: 'Оплата тренеру', icon: 'IconCash', isNullable: true, defaultValue: RUSSIAN_RUBLE_DEFAULT_VALUE },
    { universalIdentifier: '66cb5ea8-721e-4c92-8dc6-7ca5caf648c6', type: FieldType.TEXT, name: 'studioCancellationReason', label: 'Причина отмены', icon: 'IconNote', isNullable: true },
    { universalIdentifier: '49cc8fa6-6591-4e23-a538-ab494d601bfd', type: FieldType.DATE_TIME, name: 'completionLockedAt', label: 'Закрыто', icon: 'IconLock', isNullable: true },
    { universalIdentifier: '57c8b238-d981-4bb1-a7f4-713ad61e6c03', type: FieldType.TEXT, name: 'recordingKey', label: 'Ключ внесения', icon: 'IconKey', isNullable: true },
    { universalIdentifier: '63a2073b-e68c-41df-b2ab-f1c6c43cd754', type: FieldType.TEXT, name: 'creationRequest', label: 'Исходный запрос создания', icon: 'IconCode', isNullable: true },
  ],
});
