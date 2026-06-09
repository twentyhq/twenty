import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { SIZE_OPTIONS } from 'src/constants/size-options';
import {
  PDL_FIELD_UNIVERSAL_IDENTIFIERS,
  PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';
import { buildSelectOptions } from 'src/utils/build-select-options';

export default defineField({
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlJobCompanySize,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlJobCompanySize',
  label: 'Current Company Size',
  description: 'Current company size range returned by People Data Labs.',
  isNullable: true,
  options: buildSelectOptions(
    SIZE_OPTIONS,
    PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanySize,
  ),
});
