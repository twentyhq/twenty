import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlAlternativeNames,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.ARRAY,
  name: 'pdlAlternativeNames',
  label: 'Alternative Names',
  description: 'Alternative names returned by People Data Labs.',
  icon: 'IconSignature',
  isNullable: true,
});
