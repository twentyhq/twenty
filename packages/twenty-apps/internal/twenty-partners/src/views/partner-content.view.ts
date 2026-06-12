import { ViewType, defineView } from 'twenty-sdk/define';

import {
  PARTNER_CONTENT_VIEW_UNIVERSAL_IDENTIFIER,
  PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Index view for partner content.
export default defineView({
  universalIdentifier: PARTNER_CONTENT_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Partner content',
  icon: 'IconQuote',
  objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  fields: [
    { universalIdentifier: 'ad7b3702-b552-4355-afec-1e1e96d9f3df', fieldMetadataUniversalIdentifier: '9e688624-83d2-4715-8b18-80492a6de2b6', position: 0, isVisible: true },
    { universalIdentifier: 'a9bf3eaa-ec27-4a0a-8df2-e18c8f4239a7', fieldMetadataUniversalIdentifier: '1d926e6e-6ac1-4d60-ab3d-a73114005692', position: 1, isVisible: true },
    { universalIdentifier: '426e0c2d-449d-4a06-860b-0cfe0ed501e6', fieldMetadataUniversalIdentifier: 'a0fe09c4-c1f4-4b96-93c6-d7ec38f1166a', position: 2, isVisible: true },
    { universalIdentifier: 'fbd1f953-1dd2-4d0f-a239-148a0688fbff', fieldMetadataUniversalIdentifier: 'b52d263e-423e-40b0-b82c-29214597c005', position: 3, isVisible: true },
  ],
});
