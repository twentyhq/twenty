import { WorkspaceEventSinkService } from 'src/engine/core-modules/audit/services/workspace-event-sink.service';
import { type WorkspaceEventsJobData } from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';

import { WorkspaceEventsConsumer } from './workspace-events.consumer';

describe('WorkspaceEventsConsumer', () => {
  it('ingests the job events through the sink pipeline', async () => {
    const ingest = jest.fn().mockResolvedValue(undefined);

    const consumer = new WorkspaceEventsConsumer({
      ingest,
    } as unknown as WorkspaceEventSinkService);

    const data: WorkspaceEventsJobData = {
      events: [
        {
          table: 'pageview',
          row: {
            type: 'page',
            name: 'a',
            properties: {},
            timestamp: 't',
            version: '1',
          },
        },
      ],
    };

    await consumer.handle(data);

    expect(ingest).toHaveBeenCalledWith(data.events);
  });
});
