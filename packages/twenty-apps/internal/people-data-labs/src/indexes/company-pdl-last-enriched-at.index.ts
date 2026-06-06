import {
  defineIndex,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineIndex({
  universalIdentifier: 'bf1c9130-33c7-4eea-b6f2-50333481c7cc',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  fields: [
    {
      universalIdentifier: 'cb127127-0494-48a9-9784-395654e1d769',
      fieldUniversalIdentifier:
        PDL_FIELD_UNIVERSAL_IDENTIFIERS.company.pdlLastEnrichedAt,
    },
  ],
});
