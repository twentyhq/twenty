import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlAlternativeDomains,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.ARRAY,
  name: 'pdlAlternativeDomains',
  label: 'Alternative Domains',
  description: 'Alternative domains returned by People Data Labs.',
  icon: 'IconWorldWww',
  isNullable: true,
});
