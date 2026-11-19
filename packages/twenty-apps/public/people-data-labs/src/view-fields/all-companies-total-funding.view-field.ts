import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineViewField({
  universalIdentifier: '498be81a-495f-4f2b-a1ad-ffd7c32dcf2d',
  viewUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.views.allCompanies
      .universalIdentifier,
  fieldMetadataUniversalIdentifier:
    PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlTotalFunding,
  position: 2,
  isVisible: true,
});
