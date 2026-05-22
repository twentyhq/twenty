import { ViewFilterOperand, ViewType, defineView } from 'twenty-sdk/define';

import {
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  VALIDATED_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Validated partners — serves both partner intros and the public website list.
export default defineView({
  universalIdentifier: VALIDATED_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Validated partners',
  icon: 'IconCircleCheck',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  fields: [
    { universalIdentifier: '9463bf58-69d5-4309-bc6e-4835df346246', fieldMetadataUniversalIdentifier: 'a0000001-0000-4000-8000-000000000001', position: 0, isVisible: true },
    { universalIdentifier: 'c8fd88c5-ffa9-4944-b5b9-deec3acd3dff', fieldMetadataUniversalIdentifier: 'd4fa6461-37b6-49ee-9181-dd482e74a70b', position: 1, isVisible: true },
    { universalIdentifier: '9cb93542-2a91-4e75-a9f8-4a1866445322', fieldMetadataUniversalIdentifier: '500021ad-ca42-4fd3-8727-392dd26b722a', position: 2, isVisible: true },
    { universalIdentifier: 'd6df98ac-9c6c-46c2-8784-d4e1d6521f75', fieldMetadataUniversalIdentifier: '560503de-6330-4c1d-af97-a8dee125f2ad', position: 3, isVisible: true },
    { universalIdentifier: '375cc871-fdda-42d0-8308-e60174b6d467', fieldMetadataUniversalIdentifier: 'a0000004-0000-4000-8000-000000000004', position: 4, isVisible: true },
  ],
  filters: [
    {
      universalIdentifier: 'a3b7e215-693d-420c-b444-37d4109ca535',
      fieldMetadataUniversalIdentifier: '2ca9856f-f54a-4326-9ff3-668fd7da0b50',
      operand: ViewFilterOperand.IS,
      value: ['VALIDATED'],
    },
  ],
});
