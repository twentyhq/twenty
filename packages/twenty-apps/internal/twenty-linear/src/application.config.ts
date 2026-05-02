import { defineApplication } from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Linear',
  description:
    'Connect Linear to Twenty. Each workspace member connects their own Linear account; logic functions can then create issues and read team data on their behalf.',
  logoUrl: 'public/linear-logomark.svg',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  // OAuth client_id/secret live at the registration level (one OAuth app per
  // Twenty server, configured by the server admin) — not per-workspace —
  // so they're declared as serverVariables, not applicationVariables.
  serverVariables: {
    LINEAR_CLIENT_ID: {
      description:
        'OAuth client ID from your Linear OAuth application (linear.app/settings/api/applications).',
      isSecret: false,
      isRequired: true,
    },
    LINEAR_CLIENT_SECRET: {
      description:
        'OAuth client secret from your Linear OAuth application. Stored encrypted; never exposed in API responses.',
      isSecret: true,
      isRequired: true,
    },
  },
});
