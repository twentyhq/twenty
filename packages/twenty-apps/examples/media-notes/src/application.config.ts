import { defineApplication } from 'twenty-sdk/define';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from './roles/default.role';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  'c832302c-e551-4b4f-b11c-19907888a284';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Media Notes',
  description:
    'Example app demonstrating the recordAudio / recordVideo front component capability',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
