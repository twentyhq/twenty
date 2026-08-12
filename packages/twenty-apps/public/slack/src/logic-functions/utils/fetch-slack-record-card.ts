import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_RECORD_CARD_DEFINITIONS } from 'src/logic-functions/constants/slack-record-card-definitions';
import { SLACK_RECORD_CARD_MAX_DETAILS } from 'src/logic-functions/constants/slack-record-card-max-details';
import { type SlackRecordCard } from 'src/logic-functions/types/slack-record-card.type';
import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';
import { type SlackRecordNode } from 'src/logic-functions/types/slack-record-node.type';
import { buildSlackRecordCardFromLink } from 'src/logic-functions/utils/build-slack-record-card-from-link';
import { isCoreApiPermissionError } from 'src/logic-functions/utils/is-core-api-permission-error';

type SlackRecordQueryResult = Record<
  string,
  { edges?: { node?: SlackRecordNode }[] } | undefined
>;

const logEnrichmentFailure = (
  recordLink: SlackRecordLink,
  error: unknown,
): void => {
  if (isCoreApiPermissionError(error)) {
    console.log(
      `[slack] the app role cannot read ${recordLink.objectNameSingular}, so its card shows the record name only. Grant read access on the CRM objects to the app role to fill in field values.`,
    );

    return;
  }

  console.warn(
    `[slack] could not read the card fields of ${recordLink.objectNameSingular} ${recordLink.recordId}, showing the record name only: ${error instanceof Error ? error.message : String(error)}`,
  );
};

export const fetchSlackRecordCard = async (
  client: CoreApiClient,
  recordLink: SlackRecordLink,
): Promise<SlackRecordCard | undefined> => {
  const definition =
    SLACK_RECORD_CARD_DEFINITIONS[recordLink.objectNameSingular];

  if (definition === undefined) {
    return buildSlackRecordCardFromLink({ recordLink });
  }

  const fetchNode = async (
    nodeSelection: Record<string, unknown>,
  ): Promise<SlackRecordNode | undefined> => {
    const queryResult: SlackRecordQueryResult = await client.query({
      [definition.objectNamePlural]: {
        __args: { filter: { id: { eq: recordLink.recordId } }, first: 1 },
        edges: { node: nodeSelection },
      },
    });

    return queryResult[definition.objectNamePlural]?.edges?.[0]?.node;
  };

  const readNode = async (): Promise<SlackRecordNode | undefined> => {
    try {
      return await fetchNode(definition.nodeSelection);
    } catch (error) {
      // A narrower selection cannot recover a role that reads nothing.
      if (isCoreApiPermissionError(error)) {
        throw error;
      }

      return await fetchNode(definition.nameOnlyNodeSelection);
    }
  };

  try {
    const node = await readNode();

    if (node === undefined) {
      console.warn(
        `[slack] ${recordLink.objectNameSingular} ${recordLink.recordId} was linked in the answer but could not be read back, posting the answer without a card`,
      );

      return undefined;
    }

    return {
      recordName: definition.getRecordName(node) ?? recordLink.linkLabel,
      objectLabel: definition.objectLabel,
      recordUrl: recordLink.recordUrl,
      details: definition
        .getDetails(node)
        .slice(0, SLACK_RECORD_CARD_MAX_DETAILS),
    };
  } catch (error) {
    logEnrichmentFailure(recordLink, error);

    return buildSlackRecordCardFromLink({
      recordLink,
      objectLabel: definition.objectLabel,
    });
  }
};
