import { defineLogicFunction } from 'twenty-sdk/define';

import { TARGET_OBJECTS } from 'src/constants/target-objects';
import { CREATE_NOTE_FOR_PERSON_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildCreateNoteConfig } from 'src/logic-functions/utils/build-create-note-config';

export default defineLogicFunction(
  buildCreateNoteConfig({
    universalIdentifier:
      CREATE_NOTE_FOR_PERSON_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    target: TARGET_OBJECTS.person,
  }),
);
