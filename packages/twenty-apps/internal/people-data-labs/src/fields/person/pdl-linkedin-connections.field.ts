import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlLinkedinConnections,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.NUMBER,
  name: 'pdlLinkedinConnections',
  label: 'LinkedIn Connections',
  description: 'LinkedIn connection count returned by People Data Labs.',
  isNullable: true,
});
