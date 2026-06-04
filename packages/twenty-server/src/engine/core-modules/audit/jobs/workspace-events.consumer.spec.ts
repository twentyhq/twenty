import { WorkspaceEventSinkService } from 'src/engine/core-modules/audit/services/workspace-event-sink.service';
import { type WorkspaceEventsJobData } from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';
import { WorkspaceEventLiveService } from 'src/engine/subscriptions/workspace-event-live.service';

import { WorkspaceEventsConsumer } from './workspace-events.consumer';

describe('WorkspaceEventsConsumer', () => {
  it('writes events to the sinks and fans them out to live subscribers', async () => {
    const write = jest.fn().mockResolvedValue(undefined);
    const publishWatched = jest.fn().mockResolvedValue(undefined);

    const consumer = new WorkspaceEventsConsumer(
      { write } as unknown as WorkspaceEventSinkService,
      { publishWatched } as unknown as WorkspaceEventLiveService,
    );

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

    expect(write).toHaveBeenCalledWith(data.events);
    expect(publishWatched).toHaveBeenCalledWith(data.events);
  });
});
