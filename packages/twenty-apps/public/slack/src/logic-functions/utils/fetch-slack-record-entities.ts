import { type EntityMetadata } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findSlackUnfurlRecord } from 'src/logic-functions/data/find-slack-unfurl-record';
import { type SlackRecordLink } from 'src/logic-functions/types/slack-record-link.type';
import { buildSlackRecordUnfurlEntity } from 'src/logic-functions/utils/build-slack-record-unfurl-entity';

export const fetchSlackRecordEntities = async ({
  client,
  recordLinks,
  workspaceBaseUrl,
}: {
  client: CoreApiClient;
  recordLinks: SlackRecordLink[];
  workspaceBaseUrl: string;
}): Promise<EntityMetadata[]> => {
  const entities: EntityMetadata[] = [];

  for (const recordLink of recordLinks) {
    const record = await findSlackUnfurlRecord({
      client,
      objectNameSingular: recordLink.objectNameSingular,
      recordId: recordLink.recordId,
    }).catch(
      (error) => {
        console.warn(
          `[slack] record fetch for preview failed (${recordLink.objectNameSingular} ${recordLink.recordId}): ${error instanceof Error ? error.message : String(error)}`,
        );

        return undefined;
      },
    );

    if (!isDefined(record)) {
      continue;
    }

    const entity = buildSlackRecordUnfurlEntity({
      recordLink,
      record,
      workspaceBaseUrl,
    });

    if (isDefined(entity)) {
      entities.push(entity);
    }
  }

  return entities;
};
