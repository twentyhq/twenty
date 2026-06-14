import { ViewFilterOperand, ViewType, defineView } from 'twenty-sdk/define';

import {
  PARTNER_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Early-pipeline partners — grouped by Validation Stage, showing only the
// Application and Potential partner stages. Later stages are declared as hidden
// groups so their (empty) sections never render.
export default defineView({
  universalIdentifier: PARTNER_APPLICATIONS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Applications',
  icon: 'IconUserPlus',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 0,
  // Group by Validation Stage so the stage becomes the section header — this is
  // why the Validation Stage column is dropped below (it's redundant).
  mainGroupByFieldMetadataUniversalIdentifier: '2ca9856f-f54a-4326-9ff3-668fd7da0b50',
  // Column widths (size): Name + Categories are widened for readability; Skills and
  // Languages get a little extra room since they hold several chips.
  fields: [
    // Name (label identifier)
    { universalIdentifier: 'b4f505d7-3849-4a74-a27f-1c91733702b5', fieldMetadataUniversalIdentifier: 'a0000001-0000-4000-8000-000000000001', position: 0, isVisible: true, size: 200 },
    // Categories (partnerScope)
    { universalIdentifier: '2aff884c-5212-4ef7-9449-9be48ad1406c', fieldMetadataUniversalIdentifier: '500021ad-ca42-4fd3-8727-392dd26b722a', position: 1, isVisible: true, size: 260 },
    // Skills
    { universalIdentifier: '851017c4-fb46-4574-b912-189b9f229f2e', fieldMetadataUniversalIdentifier: '6f260cc0-a860-41e6-ad40-a2ef32ecffbe', position: 2, isVisible: true, size: 200 },
    // Languages Spoken
    { universalIdentifier: '02f31b03-bdda-4867-9bca-9e3378587120', fieldMetadataUniversalIdentifier: 'a0000007-0000-4000-8000-000000000007', position: 3, isVisible: true, size: 200 },
    // Country
    { universalIdentifier: '2c34a120-b0f8-421b-9546-6483f1202d9f', fieldMetadataUniversalIdentifier: 'a77d7fa6-c398-47db-af0f-036a5c719f20', position: 4, isVisible: true },
    // LinkedIn
    { universalIdentifier: 'bda8c170-a2b2-43d9-8a50-3bd51cccdf57', fieldMetadataUniversalIdentifier: '640bbf33-45d7-4174-a862-dbe611ab8d1a', position: 5, isVisible: true },
    // Type of Team (kept last)
    { universalIdentifier: '1dcf30f4-f7f3-41ce-a1af-f4b1d05eb3d6', fieldMetadataUniversalIdentifier: 'a451e557-a488-470a-8b35-6f9b8cfb1a10', position: 6, isVisible: true },
  ],
  // Application + Potential are visible; later stages are hidden so empty group
  // sections never show.
  groups: [
    { universalIdentifier: '2441704f-c832-4ca4-b4ab-0e4c87102fa9', fieldValue: 'APPLICATION', position: 0, isVisible: true },
    { universalIdentifier: '109b2df2-a3c2-4ed4-b84a-8ca1c846a6ae', fieldValue: 'POTENTIAL', position: 1, isVisible: true },
    { universalIdentifier: 'e8bd3914-84b2-4b2c-a0be-118f36868242', fieldValue: 'VALIDATED', position: 2, isVisible: false },
    { universalIdentifier: 'c5d3f331-11b2-4bc5-9c0d-0a64a5639587', fieldValue: 'FORMER', position: 3, isVisible: false },
    { universalIdentifier: 'e1e5bec5-6d1f-4d0f-9807-5507db3759fc', fieldValue: 'REJECTED', position: 4, isVisible: false },
  ],
  filters: [
    {
      universalIdentifier: '210deb57-cfca-4086-b9da-ca346fbd3126',
      fieldMetadataUniversalIdentifier: '2ca9856f-f54a-4326-9ff3-668fd7da0b50',
      operand: ViewFilterOperand.IS,
      value: ['APPLICATION', 'POTENTIAL'],
    },
  ],
});
