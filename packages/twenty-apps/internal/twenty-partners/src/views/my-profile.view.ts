import { ViewType, defineView } from 'twenty-sdk/define';

import {
  PARTNER_AVAILABILITY_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_CALENDAR_LINK_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_INTRODUCTION_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/partner-field-universal-identifiers';
import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const MY_PROFILE_VIEW_UNIVERSAL_IDENTIFIER =
  '183ab293-07ce-4be6-8dfc-436a058c36e9';

// Partner-facing profile view — the partner edits their own listing fields here.
export default defineView({
  universalIdentifier: MY_PROFILE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'My Profile',
  icon: 'IconUser',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 2,
  fields: [
    { universalIdentifier: 'e23cbd41-dfc1-45d9-b385-e3ddd9d9e909', fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 200 },
    { universalIdentifier: 'ce9249d5-914e-458a-a115-e4daa09a6f95', fieldMetadataUniversalIdentifier: PARTNER_AVAILABILITY_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 140 },
    { universalIdentifier: '8aa8bca2-8b9d-4028-b003-ab3fe8233fd1', fieldMetadataUniversalIdentifier: PARTNER_INTRODUCTION_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 320 },
    { universalIdentifier: '4349740f-7c1a-4f20-b64f-36d53b18eef1', fieldMetadataUniversalIdentifier: PARTNER_CALENDAR_LINK_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true, size: 200 },
  ],
});
