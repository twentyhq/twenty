import { FieldType, defineObject } from 'twenty-sdk/define';

export const APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER = 'c0a8b102-0000-4000-8000-000000000001';

export default defineObject({
  universalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'application',
  namePlural: 'applications',
  labelSingular: 'Application',
  labelPlural: 'Applications',
  description: 'A partner in play on a brief — invited or applied',
  icon: 'IconSend',
  isSearchable: false,
  labelIdentifierFieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000002',
  fields: [
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000002',
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconTag',
      defaultValue: "''",
    },
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000003',
      type: FieldType.SELECT,
      name: 'state',
      label: 'State',
      icon: 'IconProgressCheck',
      isNullable: false,
      defaultValue: "'INVITED'",
      options: [
        { id: 'c0a8b102-0000-4000-8000-000000000031', value: 'INVITED', label: 'Invited', position: 0, color: 'gray' },
        { id: 'c0a8b102-0000-4000-8000-000000000032', value: 'APPLIED', label: 'Applied', position: 1, color: 'blue' },
        { id: 'c0a8b102-0000-4000-8000-000000000033', value: 'INTRODUCED', label: 'Introduced', position: 2, color: 'purple' },
        { id: 'c0a8b102-0000-4000-8000-000000000034', value: 'BACKUP', label: 'Backup', position: 3, color: 'orange' },
        { id: 'c0a8b102-0000-4000-8000-000000000035', value: 'DECLINED', label: 'Declined', position: 4, color: 'red' },
      ],
    },
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000004',
      type: FieldType.SELECT,
      name: 'invitedBy',
      label: 'Invited By',
      icon: 'IconUserPlus',
      isNullable: false,
      defaultValue: "'ADMIN'",
      options: [
        { id: 'c0a8b102-0000-4000-8000-000000000041', value: 'ADMIN', label: 'Admin', position: 0, color: 'blue' },
        { id: 'c0a8b102-0000-4000-8000-000000000042', value: 'CLIENT', label: 'Client', position: 1, color: 'green' },
      ],
    },
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000005',
      type: FieldType.TEXT,
      name: 'pitch',
      label: 'Pitch',
      icon: 'IconMessage',
      isNullable: true,
    },
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000006',
      type: FieldType.TEXT,
      name: 'availabilityNote',
      label: 'Availability Note',
      icon: 'IconCalendar',
      isNullable: true,
    },
    {
      universalIdentifier: 'c0a8b102-0000-4000-8000-000000000007',
      type: FieldType.DATE_TIME,
      name: 'lastStatusAt',
      label: 'Last Status At',
      icon: 'IconClock',
      isNullable: true,
    },
  ],
});
