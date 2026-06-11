import { ViewType, defineView } from 'twenty-sdk/define';

import {
  APPLICATION_BRIEF_FIELD_ID,
  APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  APPLICATION_PARTNER_FIELD_ID,
} from 'src/objects/application.object';

// FIELDS_WIDGET view backing the Application record page / side-panel "Fields" tab.
// Relation fields (brief, partner) only render in the fields widget when an
// explicit view marks them visible.
export const APPLICATION_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER = 'c0a8b151-0000-4000-8000-000000000001';

export default defineView({
  universalIdentifier: APPLICATION_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Application Record Page Fields',
  objectUniversalIdentifier: APPLICATION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.FIELDS_WIDGET,
  fields: [
    { universalIdentifier: 'c0a8b151-0000-4000-8000-000000000011', fieldMetadataUniversalIdentifier: APPLICATION_PARTNER_FIELD_ID, position: 0, isVisible: true },
    { universalIdentifier: 'c0a8b151-0000-4000-8000-000000000012', fieldMetadataUniversalIdentifier: APPLICATION_BRIEF_FIELD_ID, position: 1, isVisible: true },
    { universalIdentifier: 'c0a8b151-0000-4000-8000-000000000013', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000003', position: 2, isVisible: true },
    { universalIdentifier: 'c0a8b151-0000-4000-8000-000000000014', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000008', position: 3, isVisible: true },
    { universalIdentifier: 'c0a8b151-0000-4000-8000-000000000015', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000005', position: 4, isVisible: true },
    { universalIdentifier: 'c0a8b151-0000-4000-8000-000000000016', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000004', position: 5, isVisible: true },
    { universalIdentifier: 'c0a8b151-0000-4000-8000-000000000017', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000007', position: 6, isVisible: true },
    { universalIdentifier: 'c0a8b151-0000-4000-8000-000000000018', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000009', position: 7, isVisible: true },
    { universalIdentifier: 'c0a8b151-0000-4000-8000-000000000019', fieldMetadataUniversalIdentifier: 'c0a8b102-0000-4000-8000-000000000010', position: 8, isVisible: true },
  ],
});
