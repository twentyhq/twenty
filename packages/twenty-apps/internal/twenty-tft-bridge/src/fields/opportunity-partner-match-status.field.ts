import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';
import { OPP_PARTNER_MATCH_STATUS_FIELD_UUID } from 'src/constants/universal-identifiers';

// Read-only mirror of the partner workspace's matchStatus, written by the reverse echo.
// Named partnerMatchStatus (not partnersSyncStatus) so it's clearly the partner lifecycle,
// distinct from the standard sales `stage` field that sits next to it.
export default defineField({
  universalIdentifier: OPP_PARTNER_MATCH_STATUS_FIELD_UUID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'partnerMatchStatus',
  label: 'Partner match status',
  description: 'Partner matching lifecycle, mirrored from the partners workspace via reverse echo',
  isNullable: true,
  options: [
    { id: 'a7d2c5f8-1b4e-4a7d-8c2f-5e8b1d4a7c2f', value: 'TO_BE_MATCHED', label: 'To be matched', position: 0, color: 'gray' },
    { id: 'b8a4c7f2-6d9e-4b4a-8f2c-4e8a4c1f7d9b', value: 'INTRODUCED_TO_A_PARTNER', label: 'Introduced to a partner', position: 1, color: 'sky' },
    { id: 'c2f7e4a5-9a3b-4c7f-9c5e-7b2e5f4a8c3d', value: 'WORKING_WITH_A_PARTNER', label: 'Working with a partner', position: 2, color: 'turquoise' },
    { id: 'd5a1b8e8-3f6c-4d1a-8b9f-2c5f1d8b4a7c', value: 'WON', label: 'Won', position: 3, color: 'green' },
    { id: 'e8f4c2b1-6a9d-4e4f-9e3b-5f8c4e2a1d6b', value: 'LOST', label: 'Lost', position: 4, color: 'red' },
  ],
});
