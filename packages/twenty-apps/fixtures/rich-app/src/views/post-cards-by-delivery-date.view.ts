import { defineView } from 'twenty-sdk/define';
import { ViewCalendarLayout, ViewType } from 'twenty-shared/types';

import {
  CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
  DELIVERED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  POST_CARD_UNIVERSAL_IDENTIFIER,
} from '../objects/post-card.object';

export const POST_CARDS_BY_DELIVERY_DATE_VIEW_ID =
  'b1a2b3c4-0005-4a7b-8c9d-0e1f2a3b4c5d';

export default defineView({
  universalIdentifier: POST_CARDS_BY_DELIVERY_DATE_VIEW_ID,
  name: 'By Delivery Date',
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  type: ViewType.CALENDAR,
  icon: 'IconCalendarEvent',
  position: 2,
  calendarLayout: ViewCalendarLayout.MONTH,
  calendarFieldMetadataUniversalIdentifier:
    DELIVERED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: 'bf1a2b3c-0006-4a7b-8c9d-0e1f2a3b4c5d',
      fieldMetadataUniversalIdentifier: CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
  ],
});
