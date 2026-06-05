import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { INDUSTRY_OPTIONS } from 'src/constants/industry-options';
import {
  PDL_FIELD_UNIVERSAL_IDENTIFIERS,
  PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';
import { buildSelectOptions } from 'src/utils/build-select-options';

export default defineField({
  universalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlJobCompanyIndustry,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlJobCompanyIndustry',
  label: 'Current Company Industry',
  description:
    'Current company canonical industry returned by People Data Labs.',
  isNullable: true,
  options: buildSelectOptions(
    INDUSTRY_OPTIONS,
    PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.personJobCompanyIndustry,
  ),
});
