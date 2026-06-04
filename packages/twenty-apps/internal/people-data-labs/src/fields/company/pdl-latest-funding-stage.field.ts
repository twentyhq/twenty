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
  universalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlLatestFundingStage,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.SELECT,
  name: 'pdlLatestFundingStage',
  label: 'Latest Funding Stage',
  description: 'People Data Labs canonical latest funding stage.',
  isNullable: true,
  options: buildSelectOptions(
    FUNDING_STAGE_OPTIONS,
    PDL_SELECT_OPTION_UNIVERSAL_IDENTIFIERS.fundingStage,
  ),
});
