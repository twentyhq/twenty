import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlTwitterUrl,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.LINKS,
  name: 'pdlTwitterUrl',
  label: 'X / Twitter',
  description: 'X or Twitter company profile returned by People Data Labs.',
  icon: 'IconBrandX',
  isNullable: true,
});
