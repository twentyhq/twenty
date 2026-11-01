import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const PERSON_TRAINING_ACTIVITY_FIELD_UNIVERSAL_IDENTIFIER =
  '53b190d3-eebd-4fc5-b96e-86b4d46ed33f';

export default defineField({
  universalIdentifier: PERSON_TRAINING_ACTIVITY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'trainingActivity',
  label: 'Активность занятий',
  description:
    'Рассчитывается автоматически по посещениям и записям на занятия',
  icon: 'IconProgress',
  defaultValue: "'NOT_STARTED'",
  options: [
    {
      id: '66d50d57-293b-4204-abf9-676a886d8d37',
      value: 'NOT_STARTED',
      label: 'Ещё не занимался',
      position: 0,
      color: 'gray',
    },
    {
      id: '518a340b-3773-4690-b6c6-c8415a527b69',
      value: 'ACTIVE',
      label: 'Активен',
      position: 1,
      color: 'green',
    },
    {
      id: 'f3683910-7551-44b8-9089-e4a4ecfd5313',
      value: 'PAUSED',
      label: 'Приостановлен',
      position: 2,
      color: 'orange',
    },
  ],
});
