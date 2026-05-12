import { defineView, ViewType } from 'twenty-sdk/define';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { PERSON_SUPERVISOR_FIELD_ID } from '../fields/person-supervisor.field';

export default defineView({
  universalIdentifier: '83418e50-ab19-598e-a91a-2e0e58c0b722',
  name: 'My Team Leads',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconUsers',
  position: 11,
  fields: [
    { universalIdentifier: 'c9d0e1f2-0304-4b5c-9d8e-7f6a5b4c3d2e', fieldMetadataUniversalIdentifier: PERSON_SUPERVISOR_FIELD_ID, position: 0, isVisible: true, size: 220 },
  ],
});
