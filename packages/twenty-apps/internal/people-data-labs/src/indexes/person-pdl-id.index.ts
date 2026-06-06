import {
  defineIndex,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { PDL_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineIndex({
  universalIdentifier: '6ab8b38f-482c-46dc-a463-202fc4307b92',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  fields: [
    {
      universalIdentifier: 'fd792806-29f1-44da-9199-f76d8219c6db',
      fieldUniversalIdentifier: PDL_FIELD_UNIVERSAL_IDENTIFIERS.person.pdlId,
    },
  ],
});
