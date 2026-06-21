import { ViewFilterOperand, ViewType, defineView } from 'twenty-sdk/define';

import {
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  VALIDATED_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { PARTNER_USER_ON_PARTNER_FIELD_ID } from 'src/fields/partner-user-on-partner.field';

// Validated partners — serves both partner intros and the public website list.
// Columns mirror the Applications view (for consistent reading) plus Partner Tier;
// Availability is dropped as a column because the view is grouped by it.
export default defineView({
  universalIdentifier: VALIDATED_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Validated',
  icon: 'IconCircleCheck',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 1,
  // Group by Availability so unavailable partners are immediately visible as
  // their own section (hence no Availability column below).
  mainGroupByFieldMetadataUniversalIdentifier: 'a0000004-0000-4000-8000-000000000004',
  groups: [
    { universalIdentifier: '1e23a5c8-a46d-4738-a610-d5a37ba64d08', fieldValue: 'AVAILABLE', position: 0, isVisible: true },
    { universalIdentifier: '656bf55a-9762-410d-bd4f-cf50ee9d810b', fieldValue: 'UNAVAILABLE', position: 1, isVisible: true },
  ],
  // Same column set/widths as Applications, plus Partner Tier right after Name.
  fields: [
    // Name (label identifier)
    { universalIdentifier: '9463bf58-69d5-4309-bc6e-4835df346246', fieldMetadataUniversalIdentifier: 'a0000001-0000-4000-8000-000000000001', position: 0, isVisible: true, size: 200 },
    // Categories (partnerScope)
    { universalIdentifier: '9cb93542-2a91-4e75-a9f8-4a1866445322', fieldMetadataUniversalIdentifier: '500021ad-ca42-4fd3-8727-392dd26b722a', position: 1, isVisible: true, size: 260 },
    // Skills
    { universalIdentifier: '73022579-b4b1-4e0e-87f8-fee2cc5ff1a1', fieldMetadataUniversalIdentifier: '6f260cc0-a860-41e6-ad40-a2ef32ecffbe', position: 2, isVisible: true, size: 200 },
    // Partner Tier (after Skills)
    { universalIdentifier: 'c8fd88c5-ffa9-4944-b5b9-deec3acd3dff', fieldMetadataUniversalIdentifier: 'd4fa6461-37b6-49ee-9181-dd482e74a70b', position: 3, isVisible: true },
    // Languages Spoken
    { universalIdentifier: '6a7d6b14-9216-42af-bbd9-89bd185fd492', fieldMetadataUniversalIdentifier: 'a0000007-0000-4000-8000-000000000007', position: 4, isVisible: true, size: 200 },
    // Country
    { universalIdentifier: '75d5dad8-259f-4911-9607-06f247410329', fieldMetadataUniversalIdentifier: 'a77d7fa6-c398-47db-af0f-036a5c719f20', position: 5, isVisible: true },
    // LinkedIn
    { universalIdentifier: '72390fd5-b148-4074-b41d-c64bc28097a6', fieldMetadataUniversalIdentifier: '640bbf33-45d7-4174-a862-dbe611ab8d1a', position: 6, isVisible: true },
    // Type of Team
    { universalIdentifier: '300ea008-d311-4375-b8eb-74e8731c52cc', fieldMetadataUniversalIdentifier: 'a451e557-a488-470a-8b35-6f9b8cfb1a10', position: 7, isVisible: true },
    // partnerUser: the login member this partner signs in as (set inline here, like setting an owner).
    { universalIdentifier: '9e06eeaa-649d-412a-aacd-0f8bf7ee69c3', fieldMetadataUniversalIdentifier: PARTNER_USER_ON_PARTNER_FIELD_ID, position: 8, isVisible: true },
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
