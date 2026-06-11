import { FieldType, defineObject } from 'twenty-sdk/define';

export const MATCH_OBJECT_UNIVERSAL_IDENTIFIER = 'c0a8b103-0000-4000-8000-000000000001';

export default defineObject({
  universalIdentifier: MATCH_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'match',
  namePlural: 'matches',
  labelSingular: 'Match',
  labelPlural: 'Matches',
  description: 'The picked partner for a brief, with the deal outcome',
  icon: 'IconTrophy',
  isSearchable: false,
  labelIdentifierFieldMetadataUniversalIdentifier: 'c0a8b103-0000-4000-8000-000000000002',
  fields: [
    {
      universalIdentifier: 'c0a8b103-0000-4000-8000-000000000002',
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconTag',
      defaultValue: "''",
    },
    {
      universalIdentifier: 'c0a8b103-0000-4000-8000-000000000003',
      type: FieldType.DATE_TIME,
      name: 'selectedAt',
      label: 'Selected At',
      icon: 'IconCalendarCheck',
      isNullable: true,
    },
    {
      universalIdentifier: 'c0a8b103-0000-4000-8000-000000000004',
      type: FieldType.DATE_TIME,
      name: 'introSentAt',
      label: 'Intro Sent At',
      icon: 'IconSend',
      isNullable: true,
    },
    {
      universalIdentifier: 'c0a8b103-0000-4000-8000-000000000005',
      type: FieldType.SELECT,
      name: 'outcome',
      label: 'Outcome',
      icon: 'IconFlag',
      isNullable: false,
      defaultValue: "'PENDING'",
      options: [
        { id: 'c0a8b103-0000-4000-8000-000000000051', value: 'PENDING', label: 'Pending', position: 0, color: 'gray' },
        { id: 'c0a8b103-0000-4000-8000-000000000052', value: 'MET', label: 'Met', position: 1, color: 'blue' },
        { id: 'c0a8b103-0000-4000-8000-000000000053', value: 'WON', label: 'Won', position: 2, color: 'green' },
        { id: 'c0a8b103-0000-4000-8000-000000000054', value: 'LOST', label: 'Lost', position: 3, color: 'red' },
      ],
    },
  ],
});
