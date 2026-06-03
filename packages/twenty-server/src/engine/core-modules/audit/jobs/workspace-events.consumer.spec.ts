import { WorkspaceEventsConsumer } from 'src/engine/core-modules/audit/jobs/workspace-events.consumer';
import { WorkspaceEventSinkService } from 'src/engine/core-modules/audit/services/workspace-event-sink.service';
import { type WorkspaceEventsJobData } from 'src/engine/core-modules/audit/types/workspace-event-envelope.type';

describe('WorkspaceEventsConsumer', () => {
  it('writes the job events to the sink service', async () => {
    const write = jest.fn().mockResolvedValue(undefined);
    const consumer = new WorkspaceEventsConsumer({
      write,
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

    expect(write).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledWith(data.events);
  });
});
