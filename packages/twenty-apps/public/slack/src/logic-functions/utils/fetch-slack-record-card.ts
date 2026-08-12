import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_RECORD_CARD_DEFINITIONS } from 'src/logic-functions/constants/slack-record-card-definitions';
import { SLACK_RECORD_CARD_MAX_DETAILS } from 'src/logic-functions/constants/slack-record-card-max-details';
import { type SlackRecordCard } from 'src/logic-functions/types/slack-record-card.type';
import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';
import { type SlackRecordNode } from 'src/logic-functions/types/slack-record-node.type';

type SlackRecordQueryResult = Record<
  string,
  { edges?: { node?: SlackRecordNode }[] } | undefined
>;

export const fetchSlackRecordCard = async (
  client: CoreApiClient,
  recordLink: SlackRecordLink,
): Promise<SlackRecordCard | undefined> => {
  const definition =
    SLACK_RECORD_CARD_DEFINITIONS[recordLink.objectNameSingular];

  if (definition === undefined) {
    return undefined;
  }

  try {
    const queryResult: SlackRecordQueryResult = await client.query({
      [definition.objectNamePlural]: {
        __args: { filter: { id: { eq: recordLink.recordId } }, first: 1 },
        edges: { node: definition.nodeSelection },
      },
    });

    const node = queryResult[definition.objectNamePlural]?.edges?.[0]?.node;

    if (node === undefined) {
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
    console.warn(
      `[slack] failed to load the record card for ${recordLink.objectNameSingular}: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
