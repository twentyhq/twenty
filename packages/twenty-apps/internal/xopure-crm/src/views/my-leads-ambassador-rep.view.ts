import { defineView, ViewType } from 'twenty-sdk/define';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { PERSON_ASSIGNED_AMBASSADOR_FIELD_ID } from '../fields/person-assigned-ambassador.field';

export default defineView({
  universalIdentifier: 'b0622af0-7907-55f6-84ff-60ec8c6250e0',
  name: 'My Leads',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconUser',
  position: 10,
  fields: [
    { universalIdentifier: 'd8d9e0e1-f1f2-4a3b-8c7d-6e5f4a3b2c1d', fieldMetadataUniversalIdentifier: PERSON_ASSIGNED_AMBASSADOR_FIELD_ID, position: 0, isVisible: true, size: 220 },
  ],
});
