import { defineObject, FieldType, RelationType } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from './executive-profile.object';

enum BoardIndependence {
  INDEPENDENT = 'Independent',
  NON_INDEPENDENT = 'NonIndependent',
  LEAD = 'Lead',
}

export const EXECUTIVE_BOARD_SERVICE_UNIVERSAL_IDENTIFIER =
  'bb7d24b7-6f48-416b-960c-3b72b4ce0efb';

export const EXECUTIVE_BOARD_SERVICE_EP_RELATION_UNIVERSAL_IDENTIFIER =
  '5bcbb1c9-4c9b-4dbb-b42a-b4ea56ff3f85';

export const EXECUTIVE_BOARD_SERVICE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER =
  'b78b0325-8f54-42fc-8d09-62c17086967b';

export const EXECUTIVE_BOARD_SERVICE_INDEPENDENCE_FIELD_UNIVERSAL_IDENTIFIER =
  'c7432c0d-0cd6-49b0-8e4f-e64fb3d29c50';

export default defineObject({
  universalIdentifier: EXECUTIVE_BOARD_SERVICE_UNIVERSAL_IDENTIFIER,
  nameSingular: 'executiveBoardService',
  namePlural: 'executiveBoardServices',
  labelSingular: 'Board Service',
  labelPlural: 'Board Services',
  description:
    'A board of directors or advisory board position held by the executive.',
  icon: 'IconBuildingCommunity',
  labelIdentifierFieldMetadataUniversalIdentifier:
    '27ba8616-1d4f-4804-93ce-5c4191e9f8e1',
  fields: [
    // MANY_TO_ONE to executiveProfile
    {
      universalIdentifier:
        EXECUTIVE_BOARD_SERVICE_EP_RELATION_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      name: 'executiveProfile',
      label: 'Executive Profile',
      description: 'The parent executive profile.',
      relationTargetObjectMetadataUniversalIdentifier:
        EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
      relationTargetFieldMetadataUniversalIdentifier:
        EXECUTIVE_BOARD_SERVICE_EP_REVERSE_RELATION_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      universalIdentifier: '27ba8616-1d4f-4804-93ce-5c4191e9f8e1',
      type: FieldType.TEXT,
      label: 'Company',
      description: 'Company or organization name for the board.',
      icon: 'IconBuilding',
      name: 'company',
    },
    {
      universalIdentifier: 'f7af7359-4bf8-4346-8ee1-36b87cb4a105',
      type: FieldType.TEXT,
      label: 'Board Role',
      description: 'Role held on the board (e.g. Chair, Member).',
      icon: 'IconUser',
      name: 'boardRole',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '3c5cb3cb-2b28-4a68-9972-2f92fea9f4bc',
      type: FieldType.DATE,
      label: 'Start Date',
      description: 'Start date of the board service.',
      icon: 'IconCalendar',
      name: 'startDate',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '1e10c897-ca4e-4043-b0b3-45e96f428b36',
      type: FieldType.DATE,
      label: 'End Date',
      description: 'End date of the board service (null if current).',
      icon: 'IconCalendarOff',
      name: 'endDate',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier:
        EXECUTIVE_BOARD_SERVICE_INDEPENDENCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Independence',
      description: 'Independence classification for the board role.',
      icon: 'IconScale',
      options: [
        {
          id: '5c478212-efff-4e8a-8b91-6a4523aa0a7d',
          value: BoardIndependence.INDEPENDENT,
          label: 'Independent',
          position: 0,
          color: 'green',
        },
        {
          id: '0bdc72b0-b397-4b98-b34e-05be30ab47a7',
          value: BoardIndependence.NON_INDEPENDENT,
          label: 'Non-Independent',
          position: 1,
          color: 'red',
        },
        {
          id: '89cc42e9-5dd8-492e-bcb7-8ef5520a8f74',
          value: BoardIndependence.LEAD,
          label: 'Lead',
          position: 2,
          color: 'blue',
        },
      ],
      name: 'independence',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'a26fc586-77ef-41b0-98d6-59136b06fbd0',
      type: FieldType.ARRAY,
      label: 'Committees',
      description: 'Committees the executive serves on for this board.',
      icon: 'IconList',
      name: 'committees',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'b7d7b3b4-98bb-44f2-9482-6c8a073fcca8',
      type: FieldType.DATE,
      label: 'Enriched Start Date',
      description: 'Verified or enriched start date from internal research.',
      icon: 'IconCalendar',
      name: 'enrichedStartDate',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '2baa06f4-c7fd-4278-a5df-148748426fc9',
      type: FieldType.DATE,
      label: 'Enriched End Date',
      description: 'Verified or enriched end date from internal research.',
      icon: 'IconCalendarOff',
      name: 'enrichedEndDate',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: '3d0cc73a-b195-4514-b8f8-001f216a820c',
      type: FieldType.TEXT,
      label: 'Source Hash',
      description: 'Content hash from the source system.',
      icon: 'IconHash',
      name: 'sourceHash',
      isNullable: true,
      defaultValue: null,
    },
  ],
  indexes: [
    {
      universalIdentifier: 'e292003c-1a3a-4d44-a45c-491217e7fb80',
      objectUniversalIdentifier: EXECUTIVE_BOARD_SERVICE_UNIVERSAL_IDENTIFIER,
      name: 'idx_executiveBoardService_executiveProfileId',
      fields: [
        {
          universalIdentifier: 'b31d1cd6-bb87-4099-90a5-47bb8e25f94f',
          fieldName: 'executiveProfile',
        },
      ],
    },
  ],
});
