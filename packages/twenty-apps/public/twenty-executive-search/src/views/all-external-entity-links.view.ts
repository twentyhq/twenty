import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { EXTERNAL_ENTITY_LINK_UNIVERSAL_IDENTIFIER } from '../objects/external-entity-link.object';

export const EXTERNAL_ENTITY_LINK_VIEW_ID =
  '5f8d0c6a-67f4-400a-97fa-d2477368031b';

export default defineView({
  universalIdentifier: EXTERNAL_ENTITY_LINK_VIEW_ID,
  name: 'All External Entity Links',
  objectUniversalIdentifier: EXTERNAL_ENTITY_LINK_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconPlugConnected',
  position: 0,
  fields: [],
});
