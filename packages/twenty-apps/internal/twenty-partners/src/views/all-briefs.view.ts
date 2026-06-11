import { ViewType, defineView } from 'twenty-sdk/define';

import { BRIEF_OBJECT_UNIVERSAL_IDENTIFIER, BRIEF_OPPORTUNITY_FIELD_ID } from 'src/objects/brief.object';

export const ALL_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER = 'c0a8b110-0000-4000-8000-000000000002';

export default defineView({
  universalIdentifier: ALL_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Briefs',
  objectUniversalIdentifier: BRIEF_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 0,
  fields: [
    { universalIdentifier: 'c0a8b120-0000-4000-8000-000000000001', fieldMetadataUniversalIdentifier: 'c0a8b101-0000-4000-8000-000000000002', position: 0, isVisible: true },
    { universalIdentifier: 'c0a8b120-0000-4000-8000-000000000005', fieldMetadataUniversalIdentifier: BRIEF_OPPORTUNITY_FIELD_ID, position: 1, isVisible: true },
    { universalIdentifier: 'c0a8b120-0000-4000-8000-000000000002', fieldMetadataUniversalIdentifier: 'c0a8b101-0000-4000-8000-000000000006', position: 2, isVisible: true },
    { universalIdentifier: 'c0a8b120-0000-4000-8000-000000000003', fieldMetadataUniversalIdentifier: 'c0a8b101-0000-4000-8000-000000000005', position: 3, isVisible: true },
    { universalIdentifier: 'c0a8b120-0000-4000-8000-000000000004', fieldMetadataUniversalIdentifier: 'c0a8b101-0000-4000-8000-000000000003', position: 4, isVisible: true },
  ],
});
