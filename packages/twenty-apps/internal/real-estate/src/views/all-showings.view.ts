import { defineView, ViewType } from 'twenty-sdk/define';
import {
  SHOWING_INTEREST_LEVEL_FIELD_UNIVERSAL_IDENTIFIER,
  SHOWING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SHOWING_SCHEDULED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  SHOWING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  SHOWING_UNIVERSAL_IDENTIFIER,
} from '../objects/showing.object';
import { PROPERTY_ON_SHOWING_ID } from '../fields/property-on-showing.field';
import { BUYER_ON_SHOWING_ID } from '../fields/buyer-on-showing.field';

export const ALL_SHOWINGS_VIEW_ID = '618f5217-ad9b-4922-8caa-38413159d872';

export default defineView({
  universalIdentifier: ALL_SHOWINGS_VIEW_ID,
  name: 'All Showings',
  objectUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCalendarEvent',
  position: 0,
  fields: [
    {
      universalIdentifier: '332eaa7b-eb59-428c-98ba-6b7297dd3491',
      fieldMetadataUniversalIdentifier: SHOWING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: 'd64a810a-6749-49b4-a606-ac6b06a346fd',
      fieldMetadataUniversalIdentifier: PROPERTY_ON_SHOWING_ID,
      position: 1,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '47165894-5959-4368-a187-701182f7c963',
      fieldMetadataUniversalIdentifier: BUYER_ON_SHOWING_ID,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '1be249ea-285c-4e94-b6bb-0673b69e7638',
      fieldMetadataUniversalIdentifier:
        SHOWING_SCHEDULED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '6dd7ec1f-5d5f-473d-bafd-7c40bf644c80',
      fieldMetadataUniversalIdentifier:
        SHOWING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '253f1693-39e2-423f-93ef-87811d0b2297',
      fieldMetadataUniversalIdentifier:
        SHOWING_INTEREST_LEVEL_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 120,
    },
  ],
});
