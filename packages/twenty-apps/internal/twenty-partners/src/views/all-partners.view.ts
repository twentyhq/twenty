import { ViewType, defineView } from 'twenty-sdk/define';

import {
  ALL_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: ALL_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Partners',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 2,
  fields: [
    { universalIdentifier: '21afcc69-09c5-42eb-a609-26c062de3bd3', fieldMetadataUniversalIdentifier: 'a0000001-0000-4000-8000-000000000001', position: 0, isVisible: true },
    { universalIdentifier: '529912f0-38fb-4821-92d3-8a0a68b9f340', fieldMetadataUniversalIdentifier: '2ca9856f-f54a-4326-9ff3-668fd7da0b50', position: 1, isVisible: true },
    { universalIdentifier: '68c6b96d-8c3d-4a3e-b4cd-3751d035b085', fieldMetadataUniversalIdentifier: 'a0000004-0000-4000-8000-000000000004', position: 2, isVisible: true },
    { universalIdentifier: '8862e4a5-525a-4a0c-8381-93ff0d01ccf0', fieldMetadataUniversalIdentifier: 'a0000007-0000-4000-8000-000000000007', position: 3, isVisible: true },
    { universalIdentifier: '4ebe0b9d-0c2d-4416-b187-150b02473a01', fieldMetadataUniversalIdentifier: 'a0000010-0000-4000-8000-000000000010', position: 4, isVisible: true },
    { universalIdentifier: '52408b5f-5e13-4e3c-af2d-ce50033ec126', fieldMetadataUniversalIdentifier: '560503de-6330-4c1d-af97-a8dee125f2ad', position: 5, isVisible: true },
    { universalIdentifier: '34d58668-a689-42e2-9aff-3fee315092d6', fieldMetadataUniversalIdentifier: '500021ad-ca42-4fd3-8727-392dd26b722a', position: 6, isVisible: true },
  ],
});
