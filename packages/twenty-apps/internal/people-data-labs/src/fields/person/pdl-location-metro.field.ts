import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { METRO_OPTIONS } from 'src/constants/metro-options';
import {
  PDL_FIELD_UNIVERSAL_IDENTIFIERS,
  PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';
import { buildSelectOptions } from 'src/utils/build-select-options';

export default defineField({
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlLocationMetro,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlLocationMetro',
  label: 'Metro Area',
  description: 'People Data Labs canonical metro area.',
  isNullable: true,
  options: buildSelectOptions(
    METRO_OPTIONS,
    PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personLocationMetro,
  ),
});
