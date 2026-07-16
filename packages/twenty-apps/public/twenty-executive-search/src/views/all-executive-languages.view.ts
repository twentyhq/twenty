import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { EXECUTIVE_LANGUAGE_UNIVERSAL_IDENTIFIER } from '../objects/executive-language.object';

export const EXECUTIVE_LANGUAGE_VIEW_ID =
  'eafe2ff3-1692-4c87-ae12-18fc41739a5f';

export default defineView({
  universalIdentifier: EXECUTIVE_LANGUAGE_VIEW_ID,
  name: 'All Languages',
  objectUniversalIdentifier: EXECUTIVE_LANGUAGE_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconLanguage',
  position: 0,
  fields: [],
});
