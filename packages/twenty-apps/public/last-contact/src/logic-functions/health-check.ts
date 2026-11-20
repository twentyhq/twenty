import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  type ApplicationHealthCheckResult,
  defineHealthCheck,
} from 'twenty-sdk/define';

import { HEALTH_CHECK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findMissingIndexViewFields } from 'src/utils/find-missing-index-view-fields';

const handler = async (): Promise<ApplicationHealthCheckResult> => {
  console.log('health-check started');

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
    (messageParticipants?.edges ?? []).length === 0 &&
    (calendarEventParticipants?.edges ?? []).length === 0
  ) {
    return {
      status: 'WARNING',
      title: 'No synced emails or meetings yet',
      description:
        'Last contact is computed from synced emails and meetings. Connect a mailbox or calendar to start tracking it.',
      action: { label: 'Connect an account', location: '/settings/accounts' },
    };
  }

  const missingFieldCount = (await findMissingIndexViewFields()).reduce(
    (count, { fields }) => count + fields.length,
    0,
  );

  if (missingFieldCount === 0) {
    return { status: 'OK' };
  }

  // No location: the banner falls back to the app's settings tab.
  return {
    status: 'INFO',
    title:
      missingFieldCount === 1
        ? 'Last contact suggests 1 field that is not in your views yet.'
        : `Last contact suggests ${missingFieldCount} fields that are not in your views yet.`,
    action: { label: 'Set with Ada' },
  };
};

export default defineHealthCheck({
  universalIdentifier: HEALTH_CHECK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'health-check',
  description:
    'Warns on the app settings page when the workspace has no synced emails or meetings, and suggests the last-contact fields missing from the All People, Companies or Opportunities views.',
  timeoutSeconds: 30,
  handler,
});
