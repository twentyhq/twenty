import { defineApplication } from 'twenty-sdk/define';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/roles/default-role';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  '33a45eef-2ad3-4c1d-99ce-73f9e905b64a';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Field actions',
  description:
    'Buttons rendered next to record fields: open a route, generate a meeting link',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
