import { ViewType, defineView } from 'twenty-sdk/define';

import {
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_OPPORTUNITY_FIELD_ID,
  APPLICATION_STATE_FIELD_ID,
} from 'src/objects/application.object';

// pitch/lastActivityAt ids are inline literals in application.object.ts (not exported).
const APPLICATION_PITCH_FIELD_ID = '0a6cd9c9-e1e9-4315-8356-b72077443805';
const APPLICATION_LAST_ACTIVITY_AT_FIELD_ID =
  'b184ac02-51b2-4442-9505-2b06f5c94112';

export const MY_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER =
  'cba45e02-b3a7-420f-ace5-5e2773076080';

// Partner-facing list of the partner's own candidacies on opportunity briefs.
// partner sees only their own rows once B7 RLS lands; unfiltered pre-B7.
export default defineView({
  universalIdentifier: MY_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'My Applications',
  icon: 'IconSend',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 0,
  fields: [
    { universalIdentifier: 'fe004e19-5aee-4716-aa6f-3d27cdc52ae2', fieldMetadataUniversalIdentifier: APPLICATION_OPPORTUNITY_FIELD_ID, position: 0, isVisible: true, size: 200 },
    { universalIdentifier: '9cf77b15-fdd6-4123-bdbf-a50e422417c2', fieldMetadataUniversalIdentifier: APPLICATION_STATE_FIELD_ID, position: 1, isVisible: true, size: 140 },
    { universalIdentifier: '321a7f6c-0207-47c2-860f-706eaa5c2fa9', fieldMetadataUniversalIdentifier: APPLICATION_PITCH_FIELD_ID, position: 2, isVisible: true, size: 280 },
    { universalIdentifier: '5f862e3f-3db0-408a-9268-c04d5ee18a91', fieldMetadataUniversalIdentifier: APPLICATION_LAST_ACTIVITY_AT_FIELD_ID, position: 3, isVisible: true, size: 180 },
  ],
});
