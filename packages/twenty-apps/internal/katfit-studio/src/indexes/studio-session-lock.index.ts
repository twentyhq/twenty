import { defineIndex } from 'twenty-sdk/define';
import {
  STUDIO_SESSION_LOCK_OBJECT_UNIVERSAL_IDENTIFIER,
  STUDIO_SESSION_LOCK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/objects/studio-session-lock.object';
export default defineIndex({
  universalIdentifier: 'e8a2e0ef-66c0-41d5-b289-d8d3c39dbdb8',
  objectUniversalIdentifier: STUDIO_SESSION_LOCK_OBJECT_UNIVERSAL_IDENTIFIER,
  isUnique: true,
  fields: [
    {
      universalIdentifier: 'ec707e3b-27b6-4501-bfca-e30ca82a74a8',
      fieldUniversalIdentifier:
        STUDIO_SESSION_LOCK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
    },
  ],
});
