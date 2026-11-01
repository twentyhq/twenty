import { defineObject, FieldType } from 'twenty-sdk/define';

export const TRAINER_RATE_ASSIGNMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'e5cf4b5f-da02-4ce1-b26a-468ddffecb85';
export const TRAINER_RATE_ASSIGNMENT_VALID_FROM_FIELD_UNIVERSAL_IDENTIFIER =
  'a592963b-c397-40af-99b7-8f17bda9c951';
export const TRAINER_RATE_ASSIGNMENT_VALID_UNTIL_FIELD_UNIVERSAL_IDENTIFIER =
  '34ebfc8f-0690-4acf-b2c1-28664a75c0d2';
export const TRAINER_RATE_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER =
  '61fc8dab-f784-407f-87fa-85fefbd6b3aa';

export default defineObject({
  universalIdentifier: TRAINER_RATE_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'trainerRateAssignment',
  namePlural: 'trainerRateAssignments',
  labelSingular: 'Назначение тарифа',
  labelPlural: 'Назначения тарифов',
  icon: 'IconCalendarEvent',
  labelIdentifierFieldMetadataUniversalIdentifier:
    TRAINER_RATE_ASSIGNMENT_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: 'e5cf4b5f-da02-4ce1-b26a-468ddffecb85',
      name: 'name',
      label: 'Название',
      type: FieldType.TEXT,
      icon: 'IconAbc',
    },
    {
      universalIdentifier: 'a592963b-c397-40af-99b7-8f17bda9c951',
      name: 'validFrom',
      label: 'Действует с',
      type: FieldType.DATE_TIME,
      icon: 'IconCalendarEvent',
    },
    {
      universalIdentifier: '34ebfc8f-0690-4acf-b2c1-28664a75c0d2',
      name: 'validUntil',
      label: 'Действует до (не включая)',
      type: FieldType.DATE_TIME,
      icon: 'IconCalendarEvent',
      isNullable: true,
    },
  ],
});
