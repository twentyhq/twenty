import { defineObject, FieldType } from 'twenty-sdk/define';

enum ShowingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export const SHOWING_UNIVERSAL_IDENTIFIER =
  '548f2632-741b-4ff2-987c-b1c906b9ba1b';

export const SHOWING_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '5fda67f0-0552-4056-86db-6cc531840d00';
export const SHOWING_SCHEDULED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'f83082b5-a65f-4dde-8836-0e32ecef8653';
export const SHOWING_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '9a7efb7e-1c82-49ec-b58b-d1bda0859fd5';
export const SHOWING_INTEREST_LEVEL_FIELD_UNIVERSAL_IDENTIFIER =
  'e27872da-9a4b-4973-a894-7bcf3b7d7773';

export default defineObject({
  universalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
  nameSingular: 'showing',
  namePlural: 'showings',
  labelSingular: 'Showing',
  labelPlural: 'Showings',
  description: 'A property visit booked for a buyer',
  icon: 'IconCalendarEvent',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SHOWING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SHOWING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Showing label, e.g. property / buyer',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: SHOWING_SCHEDULED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'scheduledAt',
      label: 'Scheduled at',
      icon: 'IconClock',
      isNullable: true,
    },
    {
      universalIdentifier: SHOWING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgress',
      defaultValue: `'${ShowingStatus.SCHEDULED}'`,
      options: [
        {
          id: 'f9337370-6b1d-44c2-9f7e-5dfeae5dc43f',
          value: ShowingStatus.SCHEDULED,
          label: 'Scheduled',
          position: 0,
          color: 'blue',
        },
        {
          id: 'f4dcdaa5-e587-4afb-b264-1b3e1d34a987',
          value: ShowingStatus.COMPLETED,
          label: 'Completed',
          position: 1,
          color: 'green',
        },
        {
          id: 'a0be44a0-64bb-4937-9b09-7d367274a658',
          value: ShowingStatus.CANCELLED,
          label: 'Cancelled',
          position: 2,
          color: 'gray',
        },
        {
          id: 'b0769e7d-4f71-41e7-aa2c-e04780efe6e0',
          value: ShowingStatus.NO_SHOW,
          label: 'No show',
          position: 3,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier: '377e4a00-8398-413a-8662-526236ff2d65',
      type: FieldType.RICH_TEXT,
      name: 'feedback',
      label: 'Feedback',
      description: 'Buyer reaction after the visit',
      icon: 'IconMessage',
      isNullable: true,
    },
    {
      universalIdentifier: SHOWING_INTEREST_LEVEL_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RATING,
      name: 'interestLevel',
      label: 'Interest level',
      icon: 'IconStar',
      isNullable: true,
      options: [
        { id: '885a6c52-512c-47b1-a160-a609dcbd82bb', value: 'RATING_1', label: '1', position: 0 },
        { id: '0dc70098-ce83-430a-bb37-d5b5f2790b90', value: 'RATING_2', label: '2', position: 1 },
        { id: '0dc70098-ce83-430a-bb37-d5b5f2790b91', value: 'RATING_3', label: '3', position: 2 },
        { id: '0dc70098-ce83-430a-bb37-d5b5f2790b92', value: 'RATING_4', label: '4', position: 3 },
        { id: '0dc70098-ce83-430a-bb37-d5b5f2790b93', value: 'RATING_5', label: '5', position: 4 },
      ],
    },
  ],
});
