import { defineApplication } from 'twenty-sdk/define';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  'c832302c-e551-4b4f-b11c-19907888a284';

// The default role is declared with defineApplicationRole() in
// src/roles/default.role.ts and picked up automatically.
export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Media Notes',
  description:
    'Example app demonstrating the recordAudio / recordVideo front component capability',
});
