import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { OPP_PARTNER_SYNC_REQUEST_FIELD_UUID } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPP_PARTNER_SYNC_REQUEST_FIELD_UUID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'partnerSyncRequest',
  label: 'Partner sync',
  description:
    'Set to Requested to push this opportunity to the partners workspace. Flips to Synced or Failed automatically.',
  isNullable: true,
  options: [
    { id: 'f3c6e9a2-5b8d-4f3c-8e6a-2b5d8f3c6e9a', value: 'REQUESTED', label: 'Requested', position: 0, color: 'blue' },
    { id: 'a6f9c2e5-8b3d-4a6f-9c2e-5b8d3a6f9c2e', value: 'SYNCED', label: 'Synced', position: 1, color: 'green' },
    { id: 'e9c2f5a8-3d6b-4e9c-8f5a-8b3d6e9c2f5a', value: 'FAILED', label: 'Failed', position: 2, color: 'red' },
  ],
});
