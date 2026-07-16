import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-profile.object';

export const EXECUTIVE_PROFILE_VIEW_ID = '47ba61ba-5f8c-46dd-8e77-f526ee9a4754';

export default defineView({
  universalIdentifier: EXECUTIVE_PROFILE_VIEW_ID,
  name: 'All Executive Profiles',
  objectUniversalIdentifier: EXECUTIVE_PROFILE_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconUserCircle',
  position: 0,
  fields: [],
});
