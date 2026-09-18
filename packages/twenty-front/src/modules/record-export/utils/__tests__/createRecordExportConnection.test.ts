import { createRecordExportConnection } from '@/record-export/utils/createRecordExportConnection';
import { type ExecutionResult, type Sink } from 'graphql-sse';
import { type ExportRecordsSubscription } from '~/generated-metadata/graphql';

let mockSink: Sink<ExecutionResult<ExportRecordsSubscription>>;
const mockDispose = jest.fn();

jest.mock('graphql-sse', () => ({
  createClient: () => ({
    dispose: mockDispose,
    subscribe: (_request: unknown, sink: typeof mockSink) => {
      mockSink = sink;
    },
  }),
}));

const input = { objectMetadataId: 'person', fieldMetadataIds: ['name'] };
const update = (values: Partial<ExportRecordsSubscription['exportRecords']>) =>
  mockSink.next({
    data: {
      exportRecords: {
        id: 'export',
        filename: 'person.csv',
        progress: 42,
        ...values,
      },
    },
  });

describe('createRecordExportConnection', () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  it('reports server progress and automatically downloads the completed file once', async () => {
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    const onProgress = jest.fn();
    const connection = createRecordExportConnection();
    const finished = connection.exportRecords({ input, onProgress });
    update({});
    expect(onProgress.mock.calls).toEqual([[0], [42]]);
    expect(click).not.toHaveBeenCalled();
    update({
      progress: 100,
      downloadUrl: '/file/record-export/export?token=token',
    });
    await expect(finished).resolves.toBeUndefined();
    expect(click).toHaveBeenCalledTimes(1);
    expect(click.mock.instances[0]).toHaveAttribute('download', 'person.csv');
    expect(click.mock.instances[0]).toHaveAttribute(
      'href',
      '/file/record-export/export?token=token',
    );
    update({
      progress: 100,
      downloadUrl: '/file/record-export/export?token=token',
    });
    mockSink.complete();
    expect(click).toHaveBeenCalledTimes(1);
    expect(mockDispose).toHaveBeenCalledTimes(1);
  });

  it('surfaces the server failure and closes the connection', async () => {
    const finished = createRecordExportConnection().exportRecords({ input });
    update({ errorMessage: 'Export failed' });
    await expect(finished).rejects.toThrow('Export failed');
    expect(mockDispose).toHaveBeenCalledTimes(1);
  });

  it.each(['error', 'complete'] as const)(
    'fails when the stream ends with %s before a download',
    async (event) => {
      const finished = createRecordExportConnection().exportRecords({ input });
      if (event === 'error') {
        mockSink.error(new Error('Network failure'));
      } else {
        mockSink.complete();
      }
      await expect(finished).rejects.toThrow(
        event === 'error' ? 'connection was lost' : 'export was interrupted',
      );
      expect(mockDispose).toHaveBeenCalledTimes(1);
    },
  );

  it('ignores late completion after cancellation', async () => {
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    const connection = createRecordExportConnection();
    const finished = connection.exportRecords({ input });
    connection.cancel();
    await expect(finished).resolves.toBeUndefined();
    update({
      progress: 100,
      downloadUrl: '/file/record-export/export?token=token',
    });
    expect(click).not.toHaveBeenCalled();
    expect(mockDispose).toHaveBeenCalledTimes(1);
  });
});
