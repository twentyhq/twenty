import { ViewType, defineView } from 'twenty-sdk/define';

import {
  APPLICATION_NAME_FIELD_ID,
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_OPPORTUNITY_FIELD_ID,
  APPLICATION_PARTNER_FIELD_ID,
  APPLICATION_PITCH_FIELD_ID,
  APPLICATION_STATE_FIELD_ID,
} from 'src/modules/application/objects/application.object';

export const PIPELINE_VIEW_UNIVERSAL_IDENTIFIER =
  'aff718b3-9f2b-42c4-9f03-8710624a8f53';

export default defineView({
  universalIdentifier: PIPELINE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Pipeline',
  icon: 'IconLayoutKanban',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  position: 3,
  type: ViewType.KANBAN,
  mainGroupByFieldMetadataUniversalIdentifier: APPLICATION_STATE_FIELD_ID,
  groups: [
    {
      universalIdentifier: 'f83ea54b-9123-4bac-9f70-f6ccae30a32e',
      fieldValue: 'APPLIED',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '28d99cbc-27d0-41d6-9389-8cc4f900ffaf',
      fieldValue: 'INVITED',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: 'e37b029a-87c2-48dd-b0af-31692c61a8d0',
      fieldValue: 'INTRODUCED',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '1454e5fe-742d-4ee4-9ac9-6e900db47c42',
      fieldValue: 'BACKUP',
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '811f5481-17d4-4f02-a72d-1ba68ba1b7b4',
      fieldValue: 'WON',
      position: 4,
      isVisible: true,
    },
    {
      universalIdentifier: '7b5eb05e-c07d-4c56-a20a-baaf262f7359',
      fieldValue: 'DECLINED',
      position: 5,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: '9bd43629-07ff-4e4b-b9d5-d9fec80a6f12',
      fieldMetadataUniversalIdentifier: APPLICATION_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '8b8f3084-bf14-428e-add5-9d2501b13c7d',
      fieldMetadataUniversalIdentifier: APPLICATION_OPPORTUNITY_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '42ea9d40-c568-459e-9a39-367c0f07e384',
      fieldMetadataUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: 'a6052de9-961f-4323-9f73-0406c6c26283',
      fieldMetadataUniversalIdentifier: APPLICATION_PITCH_FIELD_ID,
      position: 3,
      isVisible: true,
    },
  ],
});
