import { FIELD_UNIVERSAL_IDENTIFIER as TRAINER_PAY_ENTRIES_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/trainer-pay-entries-on-class-session.field';
import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import { BOOKINGS_ON_SESSION_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/session-on-booking.field';
import { CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/class-session.object';

export default definePageLayout({
  universalIdentifier: 'a6d92797-109b-4ed1-8b7f-f15a1696f9d0',
  name: 'Карточка занятия',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    { universalIdentifier: '5891080e-eebe-47cc-b0bb-43d4fea866d5', title: 'Начисления тренеру', position: 20, icon: 'IconCash', layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, widgets: [{ universalIdentifier: 'fbdd9c96-49ab-49b4-8de2-dfdc4eec4992', title: 'Начисления за занятие', type: 'FIELD', configuration: { configurationType: 'FIELD', fieldMetadataId: TRAINER_PAY_ENTRIES_FIELD_UNIVERSAL_IDENTIFIER, fieldDisplayMode: 'TABLE' } }] },
    {
      universalIdentifier: '7c7d4e06-6eb9-429d-bc93-daf6fe0776a0',
      title: 'Детали',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '5ec55299-3cd6-4481-86ae-138e90da4b48',
          title: 'Поля занятия',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
    {
      universalIdentifier: '0a20f7a1-4154-48f2-8a57-7a990f48d91f',
      title: 'Участники',
      position: 10,
      icon: 'IconUsers',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: 'ed0a1bd9-c44d-4110-b588-fa5ac22c3e1f',
          title: 'Записи клиентов',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: BOOKINGS_ON_SESSION_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
      ],
    },
  ],
});
