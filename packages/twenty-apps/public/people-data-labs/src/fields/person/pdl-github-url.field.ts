import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlGithubUrl,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.LINKS,
  name: 'pdlGithubUrl',
  label: 'GitHub',
  description: 'GitHub profile returned by People Data Labs.',
  icon: 'IconBrandGithub',
  isNullable: true,
});
