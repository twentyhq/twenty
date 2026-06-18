import { MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'matchStatus',
  label: 'Match Status',
  icon: 'IconProgressCheck',
  isNullable: false,
  defaultValue: "'TO_BE_MATCHED'",
  options: [
    // Pre-match (new). NEW UUIDs generated with `uuidgen` (v4).
    { id: '8b3a1c0e-2f64-4a87-9d2b-1e3c4f5a6b78', value: 'TO_BE_MATCHED', label: 'To Be Matched', position: 0, color: 'gray' },
    { id: '4c5d6e7f-8a9b-4c0d-9e1f-2a3b4c5d6e7f', value: 'MANUAL_MATCH',  label: 'Manual Match',  position: 1, color: 'gray' },
    { id: '7e8f9a0b-1c2d-4e3f-8a4b-5c6d7e8f9a0b', value: 'AUTO_MATCH',    label: 'Auto Match',    position: 2, color: 'yellow' },
    // Post-match. Reuse DELIVERED's UUID for MATCHED so existing rows auto-relabel.
    { id: '095428d8-4680-4a2c-af83-7809dcb3f194', value: 'MATCHED',       label: 'Matched',       position: 3, color: 'blue' },
    { id: '2f1c79a1-ca91-4937-a4c0-6422f6534d34', value: 'INTRODUCED_TO_A_PARTNER',    label: 'Introduced to a partner',    position: 4, color: 'sky' },
    { id: '45cdf6ef-8672-40d5-b71f-1e5687ba5776', value: 'WORKING_WITH_A_PARTNER',       label: 'Working with a partner',       position: 5, color: 'turquoise' },
    { id: '7189b18d-b0f7-435a-9272-f812cba5d13d', value: 'IMPLEMENTING',  label: 'Implementing',  position: 6, color: 'green' },
    { id: '54cd33bc-11ea-42f1-87c8-cd9d32d2c266', value: 'WON',     label: 'Won',     position: 7, color: 'purple' },
    { id: '505433e8-5367-4dfb-a89a-708d5182165b', value: 'RECONNECT_LATER',       label: 'Reconnect later',       position: 8, color: 'orange' },
    { id: '572a9ad2-e0a6-49f2-b1f5-e36c75cc5176', value: 'LOST',     label: 'Lost',     position: 9, color: 'red' },
  ],
});
