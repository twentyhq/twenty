import { defineView, ViewType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { PERSON_ASSIGNED_AMBASSADOR_FIELD_ID } from '../fields/person-assigned-ambassador.field';
import { PERSON_SUPERVISOR_FIELD_ID } from '../fields/person-supervisor.field';

export default defineView({
  universalIdentifier: '5a636795-88e3-5cec-bc66-68c135c8a6c2',
  name: 'Unassigned / Needs Triage',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconAlertCircle',
  position: 12,
  fields: [
    { universalIdentifier: 'ba13e4f5-a678-5d90-bc01-2d3e4f5a6b7c', fieldMetadataUniversalIdentifier: PERSON_ASSIGNED_AMBASSADOR_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: 'cb24f5a6-b789-5e01-cd12-3e4f5a6b7c8d', fieldMetadataUniversalIdentifier: PERSON_SUPERVISOR_FIELD_ID, position: 1, isVisible: true, size: 220 },
  ],
});
