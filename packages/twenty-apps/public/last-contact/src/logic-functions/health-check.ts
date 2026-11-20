import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import {
  type ApplicationHealthCheckResult,
  defineHealthCheck,
} from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { INDEX_VIEW_FIELDS } from 'src/constants/index-view-fields';
import {
  HEALTH_CHECK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SETTINGS_MENU_ITEM_SLUG,
} from 'src/constants/universal-identifiers';
import { VIEW_FIELDS_SUGGESTION_DISMISSED_KEY } from 'src/constants/view-fields-suggestion';

const findIndexViewsMissingFields = async (): Promise<string[]> => {
  const { objects, getViews } = await new MetadataApiClient().query({
    objects: {
      __args: {
        filter: {
          universalIdentifier: {
            in: INDEX_VIEW_FIELDS.map(
              ({ objectUniversalIdentifier }) => objectUniversalIdentifier,
            ),
          },
        },
        paging: { first: INDEX_VIEW_FIELDS.length },
      },
      edges: {
        node: {
          id: true,
          universalIdentifier: true,
          fieldsList: { id: true, universalIdentifier: true },
        },
      },
    },
    getViews: {
      __args: { viewTypes: ['TABLE'] },
      key: true,
      objectMetadataId: true,
      viewFields: { fieldMetadataId: true, isVisible: true },
    },
  });

  return INDEX_VIEW_FIELDS.filter(({ objectUniversalIdentifier, fields }) => {
    const object = objects.edges.find(
      ({ node }) => node.universalIdentifier === objectUniversalIdentifier,
    )?.node;

    const indexView = getViews.find(
      (view) => view.objectMetadataId === object?.id && view.key === 'INDEX',
    );

    if (!isDefined(object) || !isDefined(indexView)) {
      return false;
    }

    const visibleFieldMetadataIds = indexView.viewFields
      .filter(({ isVisible }) => isVisible)
      .map(({ fieldMetadataId }) => fieldMetadataId);

    return object.fieldsList.some(
      ({ id, universalIdentifier }) =>
        fields.some(
          (field) => field.universalIdentifier === universalIdentifier,
        ) && !visibleFieldMetadataIds.includes(id),
    );
  }).map(({ objectLabelPlural }) => objectLabelPlural);
};

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

  if (viewFieldsSuggestion?.isDismissed === true) {
    return { status: 'OK' };
  }

  const objectLabelsMissingColumns = await findIndexViewsMissingFields();

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
