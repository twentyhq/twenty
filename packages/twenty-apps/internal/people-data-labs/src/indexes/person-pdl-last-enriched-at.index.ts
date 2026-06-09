import {
  defineIndex,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineIndex({
  universalIdentifier: 'c71369f6-5ad3-4bb8-ade8-1c5597044ee7',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  fields: [
    {
      universalIdentifier: '853c9e52-6aa8-499c-a41a-ed8dcf4b6247',
      fieldUniversalIdentifier:
        PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlLastEnrichedAt,
    },
  ],
});
