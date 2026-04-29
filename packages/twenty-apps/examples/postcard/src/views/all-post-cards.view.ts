import { defineView } from 'twenty-sdk/define';
import {
  CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
  NAME_FIELD_UNIVERSAL_IDENTIFIER,
  POST_CARD_UNIVERSAL_IDENTIFIER,
} from '../objects/post-card.object';
import { RECIPIENT_ON_POST_CARD_ID } from '../fields/recipient-on-post-card.field';
import { ViewType } from 'twenty-shared/types';

export const ALL_POST_CARDS_VIEW_ID = 'b1a2b3c4-0001-4a7b-8c9d-0e1f2a3b4c5d';

export default defineView({
  universalIdentifier: ALL_POST_CARDS_VIEW_ID,
  name: 'All Post Cards',
  objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconMail',
  position: 0,
  fields: [
    {
      universalIdentifier: '501adcc2-6c2b-48bd-a042-042478e839ec',
      fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '38d9c9d1-a55c-4662-9727-e1e19bed6d82',
      fieldMetadataUniversalIdentifier: RECIPIENT_ON_POST_CARD_ID,
      position: 1,
      isVisible: true,
      size: 300,
    },
    {
      universalIdentifier: '75956ae8-5725-48be-a785-c6d1d4c74b60',
      fieldMetadataUniversalIdentifier: CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 500,
    },
    {
      universalIdentifier: 'cedd1429-c589-41d7-bae2-81b26c3534a0',
      fieldMetadataUniversalIdentifier: '87b675b8-dd8c-4448-b4ca-20e5a2234a1e',
      position: 3,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'babf6f19-6261-40cb-85fa-6c67eccf75f9',
      fieldMetadataUniversalIdentifier: 'e06abe72-5b44-4e7f-93be-afc185a3c433',
      position: 4,
      isVisible: true,
      size: 150,
    },
  ],
});
