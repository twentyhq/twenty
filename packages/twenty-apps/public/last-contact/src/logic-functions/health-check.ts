import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  type ApplicationHealthCheckResult,
  defineHealthCheck,
} from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import {
  HEALTH_CHECK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SETTINGS_MENU_ITEM_SLUG,
} from 'src/constants/universal-identifiers';
import { VIEW_FIELDS_SUGGESTION_DISMISSED_KEY } from 'src/constants/view-fields-suggestion';
import { findAllViewsMissingFields } from 'src/utils/find-all-views-missing-fields';

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

  const viewFieldsSuggestion = await kv.get<{ isDismissed: boolean }>(
    VIEW_FIELDS_SUGGESTION_DISMISSED_KEY,
  );

  if (viewFieldsSuggestion?.isDismissed) {
    return { status: 'OK' };
  }

  const objectLabelsMissingColumns = await findAllViewsMissingFields();

  if (objectLabelsMissingColumns.length === 0) {
    return { status: 'OK' };
  }

  return {
    status: 'WARNING',
    title: 'Last contact columns are not shown',
    description: `Some last contact columns are missing from the All ${objectLabelsMissingColumns.join(', ')} views. Use the settings tab to add them.`,
    action: {
      label: 'Open settings',
      location: `#${SETTINGS_MENU_ITEM_SLUG}`,
    },
  };
};

export default defineHealthCheck({
  universalIdentifier: HEALTH_CHECK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'health-check',
  description:
    'Warns on the app settings page when the workspace has no synced emails or meetings, or when the All People, Companies or Opportunities views lack the last-contact columns.',
  timeoutSeconds: 30,
  handler,
});
