import { ViewFilterOperand, ViewType, defineView } from 'twenty-sdk/define';

import {
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_OPPORTUNITY_FIELD_ID,
  APPLICATION_PARTNER_FIELD_ID,
  APPLICATION_STATE_FIELD_ID,
} from 'src/modules/application/objects/application.object';

export const APPLICATIONS_WIDGET_VIEW_UNIVERSAL_IDENTIFIER =
  'cbaf92ec-c1a2-41c2-b471-cc131b060e4e';

// TABLE_WIDGET rather than TABLE so this view stays out of the record index view pickers.
export default defineView({
  universalIdentifier: APPLICATIONS_WIDGET_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Applications on Opportunity Widget',
  icon: 'IconSend',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE_WIDGET,
  fields: [
    {
      universalIdentifier: '644e184f-82ec-4762-bc04-8c9998c2784f',
      fieldMetadataUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '0b009608-bbf4-4b2f-b2c1-533be28abc76',
      fieldMetadataUniversalIdentifier: APPLICATION_OPPORTUNITY_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '7fd677f5-01b9-4bef-9e9f-02ecb2e69eb3',
      fieldMetadataUniversalIdentifier: APPLICATION_STATE_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 140,
    },
  ],
  filters: [
    {
      universalIdentifier: 'df46abe6-a328-4a60-b658-e0866af03319',
      fieldMetadataUniversalIdentifier: APPLICATION_OPPORTUNITY_FIELD_ID,
      operand: ViewFilterOperand.IS,
      value: {
        selectedRecordIds: [],
        isCurrentRecordSelected: true,
      },
    },
  ],
});
