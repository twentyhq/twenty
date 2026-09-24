import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  type ApplicationHealthCheckResult,
  defineHealthCheck,
} from 'twenty-sdk/define';

import { HEALTH_CHECK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const handler = async (): Promise<ApplicationHealthCheckResult> => {
  const { messageParticipants, calendarEventParticipants } =
    await new CoreApiClient().query({
      messageParticipants: {
        __args: { first: 1 },
        edges: { node: { id: true } },
      },
      calendarEventParticipants: {
        __args: { first: 1 },
        edges: { node: { id: true } },
      },
    });

  if (
    (messageParticipants?.edges ?? []).length > 0 ||
    (calendarEventParticipants?.edges ?? []).length > 0
  ) {
    return { status: 'OK' };
  }

  return {
    status: 'WARNING',
    title: 'No synced emails or meetings yet',
    description:
      'Last contact is computed from synced emails and meetings. Connect a mailbox or calendar to start tracking it.',
    action: { label: 'Connect an account', location: '/settings/accounts' },
  };
};

export default defineHealthCheck({
  universalIdentifier: HEALTH_CHECK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'health-check',
  description:
    'Warns on the app settings page when the workspace has no synced emails or meetings, since every last-contact field is computed from them.',
  timeoutSeconds: 30,
  handler,
});
