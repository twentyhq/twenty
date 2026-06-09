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
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlSizeRange,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlSizeRange',
  label: 'Employee Range',
  description: 'People Data Labs canonical self-reported employee range.',
  icon: 'IconChartBar',
  isNullable: true,
  options: buildSelectOptions({
    meta: SIZE_OPTIONS,
    ids: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.sizeRange,
  }),
});
