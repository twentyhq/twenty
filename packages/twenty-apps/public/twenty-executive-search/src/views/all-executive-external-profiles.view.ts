import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { EXECUTIVE_EXTERNAL_PROFILE_UNIVERSAL_IDENTIFIER } from '../objects/executive-external-profile.object';

export const EXECUTIVE_EXTERNAL_PROFILE_VIEW_ID =
  '4d69a628-f271-442d-97e4-8610cd05188e';

export default defineView({
  universalIdentifier: EXECUTIVE_EXTERNAL_PROFILE_VIEW_ID,
  name: 'All External Profiles',
  objectUniversalIdentifier: EXECUTIVE_EXTERNAL_PROFILE_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconExternalLink',
  position: 0,
  fields: [],
});
