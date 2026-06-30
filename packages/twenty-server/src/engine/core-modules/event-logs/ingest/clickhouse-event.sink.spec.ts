import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { ClickHouseEventSink } from 'src/engine/core-modules/event-logs/ingest/clickhouse-event.sink';
import { type WorkspaceEventEnvelope } from 'src/engine/core-modules/event-logs/types/workspace-event-envelope.type';

const makePageview = (name: string): WorkspaceEventEnvelope => ({
  table: 'pageview',
  row: { type: 'page', name, properties: {}, timestamp: 't', version: '1' },
});

const applicationLog: WorkspaceEventEnvelope = {
  table: 'applicationLog',
  row: {
    timestamp: 't',
    workspaceId: 'w',
    applicationId: '',
    logicFunctionId: '',
    logicFunctionName: 'fn',
    executionId: 'e',
    level: 'INFO',
    message: 'm',
  },
};

describe('ClickHouseEventSink', () => {
  let sink: ClickHouseEventSink;
  let insert: jest.Mock;
  let getMainClient: jest.Mock;

  beforeEach(() => {
    insert = jest.fn().mockResolvedValue({ success: true });
    getMainClient = jest.fn().mockReturnValue({});

    sink = new ClickHouseEventSink({
      insert,
      getMainClient,
    } as unknown as ClickHouseService);
  });

  it('groups envelopes by table and inserts each group once', async () => {
    const first = makePageview('a');
    const second = makePageview('b');

    await sink.write([first, second, applicationLog]);

    expect(insert).toHaveBeenCalledTimes(2);
    expect(insert).toHaveBeenCalledWith('pageview', [first.row, second.row]);
    expect(insert).toHaveBeenCalledWith('applicationLog', [applicationLog.row]);
  });

  it('no-ops when ClickHouse is not configured', async () => {
    getMainClient.mockReturnValue(undefined);

    await sink.write([makePageview('a')]);

    expect(insert).not.toHaveBeenCalled();
  });

  it('no-ops on an empty batch', async () => {
    await sink.write([]);

    expect(insert).not.toHaveBeenCalled();
  });

  it('throws when a ClickHouse insert fails so the consumer retries', async () => {
    insert.mockResolvedValue({ success: false });

    await expect(sink.write([makePageview('a')])).rejects.toThrow();
  });
});
