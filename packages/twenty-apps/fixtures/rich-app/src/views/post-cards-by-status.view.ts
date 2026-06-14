import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-shared/types';

import {
  CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
  POST_CARD_UNIVERSAL_IDENTIFIER,
  STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from '../objects/post-card.object';

export const POST_CARDS_BY_STATUS_VIEW_ID =
  'b1a2b3c4-0004-4a7b-8c9d-0e1f2a3b4c5d';

export default defineView({
  universalIdentifier: POST_CARDS_BY_STATUS_VIEW_ID,
  name: 'By Status',
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  type: ViewType.KANBAN,
  icon: 'IconLayoutKanban',
  position: 1,
  mainGroupByFieldMetadataUniversalIdentifier:
    STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: 'bf1a2b3c-0005-4a7b-8c9d-0e1f2a3b4c5d',
      fieldMetadataUniversalIdentifier: CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
  ],
  groups: [
    {
      universalIdentifier: 'e9ed34f1-3c3d-41b1-869b-00aae0033d9c',
      fieldValue: 'DRAFT',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '19b1a3c1-53f0-4d32-b072-d645dac98e38',
      fieldValue: 'SENT',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: 'f545cb5a-370d-423f-9b4e-278a9a465bdf',
      fieldValue: 'DELIVERED',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '5d4c6d5f-af53-4cd0-a843-df38915561b2',
      fieldValue: 'RETURNED',
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '5ebbd7dc-9939-4594-b2a0-519269b4531f',
      fieldValue: 'LOST',
      position: 4,
      isVisible: true,
    },
  ],
});
