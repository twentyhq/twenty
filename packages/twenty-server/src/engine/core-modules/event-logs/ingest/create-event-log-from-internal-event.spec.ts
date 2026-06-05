import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { CreateEventLogFromInternalEvent } from 'src/engine/core-modules/event-logs/ingest/create-event-log-from-internal-event';
import { WorkspaceEventSinkService } from 'src/engine/core-modules/event-logs/ingest/workspace-event-sink.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

describe('CreateEventLogFromInternalEvent', () => {
  it('ingests object events (persist + live fan-out) through the sink pipeline', async () => {
    const ingest = jest.fn().mockResolvedValue(undefined);

    const handler = new CreateEventLogFromInternalEvent({
      isEnabled: () => true,
      ingest,
    } as unknown as WorkspaceEventSinkService);

    const batch = {
      name: 'company.created',
      workspaceId: 'workspace-1',
      objectMetadata: { id: 'object-metadata-1' },
      events: [{ recordId: 'record-1', userId: 'user-1', properties: {} }],
    } as unknown as WorkspaceEventBatch<ObjectRecordEvent>;

    await handler.handle(batch);

    const ingestedEnvelopes = ingest.mock.calls[0]?.[0];

    expect(ingestedEnvelopes).toHaveLength(1);
    expect(ingestedEnvelopes[0].table).toBe('objectEvent');
  });
});
