import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { EXECUTIVE_ARTIFACT_UNIVERSAL_IDENTIFIER } from '../objects/executive-artifact.object';

export const EXECUTIVE_ARTIFACT_VIEW_ID =
  '7274bd93-85c7-4fd3-893e-b2796117cd30';

export default defineView({
  universalIdentifier: EXECUTIVE_ARTIFACT_VIEW_ID,
  name: 'All Artifacts',
  objectUniversalIdentifier: EXECUTIVE_ARTIFACT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconFile',
  position: 0,
  fields: [],
});
