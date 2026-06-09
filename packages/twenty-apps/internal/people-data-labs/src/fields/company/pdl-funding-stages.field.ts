import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { FUNDING_STAGE_OPTIONS } from 'src/constants/funding-stage-options';
import {
  PDL_FIELD_UNIVERSAL_IDENTIFIERS,
  PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';
import { buildSelectOptions } from 'src/utils/build-select-options';

export default defineField({
  universalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlFundingStages,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.MULTI_SELECT,
  name: 'pdlFundingStages',
  label: 'Funding Stages',
  description: 'People Data Labs canonical funding stages.',
  icon: 'IconChartArrowsVertical',
  isNullable: true,
  options: buildSelectOptions({
    meta: FUNDING_STAGE_OPTIONS,
    ids: PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.fundingStage,
  }),
});
