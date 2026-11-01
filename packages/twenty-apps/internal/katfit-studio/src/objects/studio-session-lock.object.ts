import { defineObject, FieldType } from 'twenty-sdk/define';
export const STUDIO_SESSION_LOCK_OBJECT_UNIVERSAL_IDENTIFIER =
  '03252a0e-b065-4079-b270-bb0ed5a82da3';
export const STUDIO_SESSION_LOCK_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '36c900d5-d3e5-4851-a03c-57f06e2124a9';
export default defineObject({
  universalIdentifier: STUDIO_SESSION_LOCK_OBJECT_UNIVERSAL_IDENTIFIER,
  isUICreatable: false,
  isUIEditable: false,
  nameSingular: 'studioSessionLock',
  namePlural: 'studioSessionLocks',
  labelSingular: 'Блокировка операции занятия',
  labelPlural: 'Блокировки операций занятий',
  icon: 'IconLock',
  labelIdentifierFieldMetadataUniversalIdentifier:
    STUDIO_SESSION_LOCK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: STUDIO_SESSION_LOCK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'name',
      label: 'ID занятия',
      type: FieldType.TEXT,
      icon: 'IconKey',
    },
    {
      universalIdentifier: '12d6598c-1895-4eca-b51c-bd389a6a02eb',
      name: 'acquiredAt',
      label: 'Начало операции',
      type: FieldType.DATE_TIME,
      icon: 'IconCalendarClock',
    },
  ],
});
