import {
  defineIndex,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineIndex({
  universalIdentifier: 'b030537d-90e1-4b0a-9def-738ab78c36e0',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  fields: [
    {
      universalIdentifier: 'b6875e91-f80e-4d6c-bbc1-9ea9217def09',
      fieldUniversalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlId,
    },
  ],
});
