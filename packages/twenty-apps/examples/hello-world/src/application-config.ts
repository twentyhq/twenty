import { defineApplication } from 'twenty-sdk/define';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  'bb1decf6-dee5-43ef-b881-9799f97b02a8';

// The default role is declared with defineApplicationRole() in
// src/roles/default-role.ts and picked up automatically.
export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Hello world',
  description: '',
});
