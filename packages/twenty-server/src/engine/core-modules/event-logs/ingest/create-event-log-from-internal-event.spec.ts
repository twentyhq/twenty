import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { CreateEventLogFromInternalEvent } from 'src/engine/core-modules/event-logs/ingest/create-event-log-from-internal-event';
import { WorkspaceEventSinkService } from 'src/engine/core-modules/event-logs/ingest/workspace-event-sink.service';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

describe('CreateEventLogFromInternalEvent', () => {
  let ingest: jest.Mock;
  let addToQueue: jest.Mock;
  let handler: CreateEventLogFromInternalEvent;

  const batch = {
    name: 'company.created',
    workspaceId: 'workspace-1',
    objectMetadata: { id: 'object-metadata-1' },
    events: [{ recordId: 'record-1', userId: 'user-1', properties: {} }],
  } as unknown as WorkspaceEventBatch<ObjectRecordEvent>;

  const transientError = Object.assign(
    new Error('Failed to insert 1 objectEvent row(s) into ClickHouse'),
    { cause: new Error('Timeout error.') },
  );

  beforeEach(() => {
    ingest = jest.fn().mockResolvedValue(undefined);
    addToQueue = jest.fn().mockResolvedValue(undefined);

    handler = new CreateEventLogFromInternalEvent(
      {
        isEnabled: () => true,
        ingest,
      } as unknown as WorkspaceEventSinkService,
      { add: addToQueue } as unknown as MessageQueueService,
    );
  });

  it('ingests object events (persist + live fan-out) through the sink pipeline', async () => {
    await handler.handle(batch);

    const ingestedEnvelopes = ingest.mock.calls[0]?.[0];

    expect(ingestedEnvelopes).toHaveLength(1);
    expect(ingestedEnvelopes[0].table).toBe('objectEvent');
  });

  it('requeues once on a transient ClickHouse network error instead of failing', async () => {
    ingest.mockRejectedValue(transientError);

    await expect(handler.handle(batch)).resolves.toBeUndefined();

    expect(addToQueue).toHaveBeenCalledWith(
      CreateEventLogFromInternalEvent.name,
      expect.objectContaining({ transientErrorRetryCount: 1 }),
    );
  });

  it('drops the batch after the transient retry budget is exhausted', async () => {
    ingest.mockRejectedValue(transientError);

    await expect(
      handler.handle({ ...batch, transientErrorRetryCount: 1 }),
    ).resolves.toBeUndefined();

    expect(addToQueue).not.toHaveBeenCalled();
  });

  it('rethrows non-transient ingestion errors so they fail the job and reach Sentry', async () => {
    const error = new Error(
      'Failed to insert 1 objectEvent row(s) into ClickHouse: (total) memory limit exceeded',
    );

    ingest.mockRejectedValue(error);

    await expect(handler.handle(batch)).rejects.toBe(error);
    expect(addToQueue).not.toHaveBeenCalled();
  });
});
