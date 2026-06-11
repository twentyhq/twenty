import { ViewType, defineView } from 'twenty-sdk/define';

import {
  APPLICATION_BRIEF_FIELD_ID,
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_PARTNER_FIELD_ID,
} from 'src/objects/application.object';

export const ALL_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER = 'c0a8b110-0000-4000-8000-000000000003';

export default defineView({
  universalIdentifier: ALL_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Applications',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 0,
  fields: [
    { universalIdentifier: 'c0a8b121-0000-4000-8000-000000000001', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000002', position: 0, isVisible: true },
    { universalIdentifier: 'c0a8b121-0000-4000-8000-000000000002', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000003', position: 1, isVisible: true },
    { universalIdentifier: 'c0a8b121-0000-4000-8000-000000000005', fieldMetadataUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID, position: 2, isVisible: true },
    { universalIdentifier: 'c0a8b121-0000-4000-8000-000000000006', fieldMetadataUniversalIdentifier: APPLICATION_BRIEF_FIELD_ID, position: 3, isVisible: true },
    { universalIdentifier: 'c0a8b121-0000-4000-8000-000000000007', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000008', position: 4, isVisible: true },
    { universalIdentifier: 'c0a8b121-0000-4000-8000-000000000004', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000007', position: 5, isVisible: true },
  ],
});
