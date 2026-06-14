import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlFacebookUrl,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.LINKS,
  name: 'pdlFacebookUrl',
  label: 'Facebook',
  description: 'Facebook page returned by People Data Labs.',
  icon: 'IconBrandFacebook',
  isNullable: true,
});
