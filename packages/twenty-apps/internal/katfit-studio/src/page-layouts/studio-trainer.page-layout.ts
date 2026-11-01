import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';
import { STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/studio-trainer.object';
import { FIELD_UNIVERSAL_IDENTIFIER as SESSIONS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/class-sessions-on-studio-trainer.field';
import { FIELD_UNIVERSAL_IDENTIFIER as PAY_ENTRIES_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/pay-entries-on-studio-trainer.field';
import { FIELD_UNIVERSAL_IDENTIFIER as ASSIGNMENTS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/fields/rate-assignments-on-studio-trainer.field';

export default definePageLayout({
  universalIdentifier: 'c141ad47-8dce-42eb-b7e4-b7c1dc98f68e',
  name: 'Карточка тренера',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: 'd139cd86-a38d-41dc-b8af-f6d8ae305b0c',
      title: 'Детали',
      position: 0,
      icon: 'IconUser',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '236f5a84-ec9b-4f19-94e9-298b5d00fc69',
          title: 'Данные тренера',
          type: 'FIELDS',
          configuration: { configurationType: 'FIELDS' },
        },
      ],
    },
    {
      universalIdentifier: 'b2dc92f2-22d0-47a8-b238-713eb211a0a9',
      title: 'Тренировки',
      position: 10,
      icon: 'IconCalendarEvent',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '9cd73ffa-dfdc-42b0-b6c8-31e3f7ebe778',
          title: 'Тренировки',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: SESSIONS_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
      ],
    },
    {
      universalIdentifier: '1b574919-6360-493e-8028-a84210d4680d',
      title: 'Начисления',
      position: 20,
      icon: 'IconCash',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '814a3a96-ef1e-48b9-8c19-fb783c9761d4',
          title: 'Начисления',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: PAY_ENTRIES_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
      ],
    },
    {
      universalIdentifier: 'f1585d92-e1aa-468d-81d7-aec378625ffb',
      title: 'Тарифы',
      position: 30,
      icon: 'IconSettings',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '80434444-8648-4a71-98eb-49f252a9f4dd',
          title: 'Тарифы',
          type: 'FIELD',
          configuration: {
            configurationType: 'FIELD',
            fieldMetadataId: ASSIGNMENTS_FIELD_UNIVERSAL_IDENTIFIER,
            fieldDisplayMode: 'TABLE',
          },
        },
      ],
    },
  ],
});
