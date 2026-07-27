import {
  defineView,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
} from 'twenty-sdk/define';
import { PERSON_TYPE_FIELD_UNIVERSAL_IDENTIFIER } from '../fields/person-type.field';
import { LISTED_PROPERTIES_ON_PERSON_ID } from '../fields/listing-agent-on-property.field';

export const AGENTS_VIEW_ID = '799dbc65-52e7-4533-874c-aeac05f599fa';

const personFields = STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.fields;

export default defineView({
  universalIdentifier: AGENTS_VIEW_ID,
  name: 'Agents',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconUserStar',
  position: 10,
  fields: [
    { universalIdentifier: 'be978ab0-6e04-4c63-a233-982310142296', fieldMetadataUniversalIdentifier: personFields.name.universalIdentifier, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '7543b11d-9058-420e-912b-558a9623d806', fieldMetadataUniversalIdentifier: PERSON_TYPE_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 130 },
    { universalIdentifier: 'dde38d0d-2e36-4cc5-9205-3fb2b6a19612', fieldMetadataUniversalIdentifier: LISTED_PROPERTIES_ON_PERSON_ID, position: 2, isVisible: true, size: 260 },
  ],
  filters: [
    {
      universalIdentifier: '121391c6-c578-4b67-bab0-6e8ce8ead74b',
      fieldMetadataUniversalIdentifier: PERSON_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: ['AGENT'],
    },
  ],
});
