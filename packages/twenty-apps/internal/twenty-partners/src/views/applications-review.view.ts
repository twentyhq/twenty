import { ViewSortDirection, ViewType, defineView } from 'twenty-sdk/define';

import {
  APPLICATION_LAST_ACTIVITY_AT_FIELD_ID,
  APPLICATION_NAME_FIELD_ID,
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_OPPORTUNITY_FIELD_ID,
  APPLICATION_PARTNER_FIELD_ID,
  APPLICATION_PITCH_FIELD_ID,
  APPLICATION_STATE_FIELD_ID,
} from 'src/objects/application.object';

export const APPLICATIONS_REVIEW_VIEW_UNIVERSAL_IDENTIFIER =
  'cc652ba3-23e8-4e0e-a616-c9fa50b702a0';

export default defineView({
  universalIdentifier: APPLICATIONS_REVIEW_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Applications',
  icon: 'IconUserPlus',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 2,
  mainGroupByFieldMetadataUniversalIdentifier: APPLICATION_STATE_FIELD_ID,
  groups: [
    {
      universalIdentifier: '332125fd-b69f-4bb8-b33d-a07ead1ca051',
      fieldValue: 'APPLIED',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '90af09ea-806b-446a-9816-91dd878eb485',
      fieldValue: 'INVITED',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: 'e16ad28d-27aa-454f-b9f3-ab35697e0856',
      fieldValue: 'INTRODUCED',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: 'f122dd3d-e660-44da-b250-73cbdc6a1135',
      fieldValue: 'WON',
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '22074627-0b0b-4d6d-a377-1cf34cf7bc6c',
      fieldValue: 'DECLINED',
      position: 4,
      isVisible: true,
    },
    {
      universalIdentifier: '274c32e1-d149-45ce-9f48-94fa7a42c77a',
      fieldValue: 'BACKUP',
      position: 5,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'e91b83e8-a774-4057-9068-892463de7366',
      fieldMetadataUniversalIdentifier: APPLICATION_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'db3ed5b7-468a-468f-a3b6-c482773a7bc1',
      fieldMetadataUniversalIdentifier: APPLICATION_OPPORTUNITY_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '0142b9ed-3f9c-4697-ab3f-9240c7812b4d',
      fieldMetadataUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'a2317ac0-1086-44c5-8f3a-c8a7d9f8edcf',
      fieldMetadataUniversalIdentifier: APPLICATION_STATE_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '36a138d6-09dc-4ed9-8517-6b20778f5836',
      fieldMetadataUniversalIdentifier: APPLICATION_PITCH_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: '651dfe47-a00f-4ad5-9af8-95a656ec0b31',
      fieldMetadataUniversalIdentifier: APPLICATION_LAST_ACTIVITY_AT_FIELD_ID,
      position: 5,
      isVisible: true,
      size: 180,
    },
  ],
  sorts: [
    {
      universalIdentifier: '2ea53941-c791-4684-b328-c3787292dbf4',
      fieldMetadataUniversalIdentifier: APPLICATION_STATE_FIELD_ID,
      direction: ViewSortDirection.ASC,
    },
  ],
});
