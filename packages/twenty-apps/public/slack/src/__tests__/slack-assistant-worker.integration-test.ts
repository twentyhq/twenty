import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterAll, describe, expect, it } from 'vitest';

import { SLACK_ASSISTANT_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import {
  buildSlackMessageTimestamp,
  SLACK_TEST_CHANNEL_ID,
  SLACK_TEST_USER_ID,
} from 'src/__tests__/utils/build-slack-event-body';
import {
  executeSlackLogicFunction,
  runSlackLogicFunction,
} from 'src/__tests__/utils/execute-slack-logic-function';
import {
  createSlackAssistantRequestRecord,
  destroySlackAssistantRequestRecords,
  findSlackAssistantRequestById,
  type SlackAssistantRequestTestRecord,
} from 'src/__tests__/utils/slack-assistant-request-records';

const WORKER_TEST_TIMEOUT_MS = 240_000;

const runWorker = (record: Record<string, unknown>) =>
  runSlackLogicFunction<Record<string, unknown>>({
    universalIdentifier: SLACK_ASSISTANT_WORKER_UNIVERSAL_IDENTIFIER,
    payload: { recordId: record.id, properties: { after: record } },
  });

describe('Slack assistant worker', () => {
  const client = new CoreApiClient();
  const createdRecordIds: string[] = [];

  const createPendingRequest = async (
    overrides: Record<string, unknown> = {},
  ): Promise<SlackAssistantRequestTestRecord> => {
    const record = await createSlackAssistantRequestRecord(client, {
      name: 'how many companies do we have?',
      slackEventId: `Ev${Date.now()}`,
      slackChannelId: SLACK_TEST_CHANNEL_ID,
      slackChannelType: 'channel',
      slackMessageTimestamp: buildSlackMessageTimestamp(),
      slackThreadTimestamp: '',
      slackUserId: SLACK_TEST_USER_ID,
      requestText: 'how many companies do we have?',
      status: SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
      ...overrides,
    });

    createdRecordIds.push(record.id);

    return record;
  };

  afterAll(async () => {
    await destroySlackAssistantRequestRecords(client, createdRecordIds);
  });

  it('should skip a request that is not pending', async () => {
    const record = await createPendingRequest({
      status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
    });

    await expect(runWorker({ ...record })).resolves.toEqual({
      skipped: true,
      reason: 'Request is not pending',
    });
  });

  it('should skip a request that lost its Slack coordinates', async () => {
    const record = await createPendingRequest();

    await expect(
      runWorker({ ...record, slackMessageTimestamp: '' }),
    ).resolves.toEqual({
      skipped: true,
      reason: 'Request record is missing fields',
    });
  });

  it(
    'should mark the request as failed when the answer cannot be delivered to Slack',
    async () => {
      const record = await createPendingRequest();

      const execution = await executeSlackLogicFunction({
        universalIdentifier: SLACK_ASSISTANT_WORKER_UNIVERSAL_IDENTIFIER,
        payload: { recordId: record.id, properties: { after: { ...record } } },
      });

      expect(execution.status).toBe('SUCCESS');
      expect(execution.data).toMatchObject({ failed: true });
      // The thinking indicator is best effort: it must be logged, never thrown.
      expect(execution.logs).toContain('[slack]');

      const storedRecord = await findSlackAssistantRequestById(
        client,
        record.id,
      );

      expect(storedRecord?.status).toBe(SLACK_ASSISTANT_REQUEST_STATUS.FAILED);
      expect(storedRecord?.errorMessage).not.toBe('');
    },
    WORKER_TEST_TIMEOUT_MS,
  );
});
