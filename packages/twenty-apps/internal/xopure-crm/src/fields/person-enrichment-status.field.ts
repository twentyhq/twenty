import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export const PERSON_XOPURE_ENRICHMENT_STATUS_FIELD_ID =
  '4838a1f0-349f-4ff4-887a-1c4a535c019c';

export default defineField({
  universalIdentifier: PERSON_XOPURE_ENRICHMENT_STATUS_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'xopureEnrichmentStatus',
  label: 'XO Pure enrichment status',
  description: 'Current research/enrichment state for this contact.',
  icon: 'IconUserSearch',
  defaultValue: "'NOT_STARTED'",
  options: [
    { id: '1423bca4-d2ea-452f-851f-95cb17bde0b6', value: 'NOT_STARTED', label: 'Not started', position: 0, color: 'gray' },
    { id: '4dc911e4-ac7e-488b-84d8-a87cfdf63e35', value: 'QUEUED', label: 'Queued', position: 1, color: 'yellow' },
    { id: 'd777f802-e3e9-4142-bcc3-dc21bd51dad3', value: 'ENRICHED', label: 'Enriched', position: 2, color: 'green' },
    { id: '8d70aef0-cc71-4303-bfc9-99f75edc19eb', value: 'FAILED', label: 'Failed', position: 3, color: 'red' },
  ],
});
