import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: '0211b754-da6e-4454-8337-693c41fb96fc',
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.views.allCompanies
      .universalIdentifier,
  fieldMetadataUniversalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlEmployeeCount,
  position: 1,
  isVisible: true,
});
