import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlBirthDate,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.DATE,
  name: 'pdlBirthDate',
  label: 'Birth Date',
  description: 'Birth date returned by People Data Labs.',
  isNullable: true,
});
