import { defineApplication } from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  REQUESTED_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Grant demo',
  description:
    'Exercises granted roles: requests its own object, read on companies and read on all objects.',
  defaultRoleUniversalIdentifier: REQUESTED_ROLE_UNIVERSAL_IDENTIFIER,
});
