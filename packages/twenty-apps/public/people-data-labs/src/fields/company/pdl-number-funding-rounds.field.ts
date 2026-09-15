import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlNumberFundingRounds,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.NUMBER,
  name: 'pdlNumberFundingRounds',
  label: 'Number of Funding Rounds',
  description: 'Number of funding rounds returned by People Data Labs.',
  icon: 'IconCoins',
  isNullable: true,
});
