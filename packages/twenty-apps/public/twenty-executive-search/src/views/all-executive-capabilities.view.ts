import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-shared/types';
import { EXECUTIVE_CAPABILITY_UNIVERSAL_IDENTIFIER } from '../objects/executive-capability.object';

export const EXECUTIVE_CAPABILITY_VIEW_ID =
  '27bcd22e-67cc-46e9-86c4-5371ab81b2a8';

export default defineView({
  universalIdentifier: EXECUTIVE_CAPABILITY_VIEW_ID,
  name: 'All Capabilities',
  objectUniversalIdentifier: EXECUTIVE_CAPABILITY_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconBrain',
  position: 0,
  fields: [],
});
