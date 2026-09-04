import { ViewFilterOperand, ViewType, defineView } from 'twenty-sdk/define';

import {
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_OPPORTUNITY_FIELD_ID,
  APPLICATION_PARTNER_FIELD_ID,
  APPLICATION_STATE_FIELD_ID,
} from 'src/modules/application/objects/application.object';

export const APPLICATIONS_ON_PARTNER_WIDGET_VIEW_UNIVERSAL_IDENTIFIER =
  '22d162c7-404a-4f09-92c9-790d3c33a733';

// TABLE_WIDGET rather than TABLE so this view stays out of the record index view pickers.
export default defineView({
  universalIdentifier: APPLICATIONS_ON_PARTNER_WIDGET_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Applications on Partner Widget',
  icon: 'IconSend',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE_WIDGET,
  fields: [
    {
      universalIdentifier: 'd9d4571b-5d73-4a84-ad82-e1e6fb730bc2',
      fieldMetadataUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '607be829-a697-41f8-8fe6-a2515ba20f91',
      fieldMetadataUniversalIdentifier: APPLICATION_OPPORTUNITY_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: 'eb9a5b92-c697-41bf-83a9-bf0780eb4b51',
      fieldMetadataUniversalIdentifier: APPLICATION_STATE_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 140,
    },
  ],
  filters: [
    {
      universalIdentifier: '1fc71ed2-319c-4267-b997-033056653d70',
      fieldMetadataUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID,
      operand: ViewFilterOperand.IS,
      value: {
        selectedRecordIds: [],
        isCurrentRecordSelected: true,
      },
    },
  ],
});
