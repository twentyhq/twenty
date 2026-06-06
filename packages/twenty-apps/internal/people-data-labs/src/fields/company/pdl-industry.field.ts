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
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlIndustry,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlIndustry',
  label: 'Industry',
  description: 'People Data Labs canonical industry.',
  isNullable: true,
  options: buildSelectOptions(
    INDUSTRY_OPTIONS,
    PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.companyIndustry,
  ),
});
