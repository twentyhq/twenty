import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { CreateAuditLogFromInternalEvent } from 'src/engine/core-modules/audit/jobs/create-audit-log-from-internal-event';
import { WorkspaceEventSinkService } from 'src/engine/core-modules/audit/services/workspace-event-sink.service';
import { WorkspaceEventLiveService } from 'src/engine/subscriptions/workspace-event-live.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

describe('CreateAuditLogFromInternalEvent', () => {
  it('persists object events and fans them out to live subscribers', async () => {
    const write = jest.fn().mockResolvedValue(undefined);
    const publishWatched = jest.fn().mockResolvedValue(undefined);

    const handler = new CreateAuditLogFromInternalEvent(
      {
        isEnabled: () => true,
        write,
      } as unknown as WorkspaceEventSinkService,
      { publishWatched } as unknown as WorkspaceEventLiveService,
    );

    const batch = {
      name: 'company.created',
      workspaceId: 'workspace-1',
      objectMetadata: { id: 'object-metadata-1' },
      events: [{ recordId: 'record-1', userId: 'user-1', properties: {} }],
    } as unknown as WorkspaceEventBatch<ObjectRecordEvent>;

    await handler.handle(batch);

    const writtenEnvelopes = write.mock.calls[0]?.[0];

    expect(writtenEnvelopes).toHaveLength(1);
    expect(writtenEnvelopes[0].table).toBe('objectEvent');
    // The object-event path must both persist and live-publish the same batch.
    expect(publishWatched).toHaveBeenCalledWith(writtenEnvelopes);
  });
});
