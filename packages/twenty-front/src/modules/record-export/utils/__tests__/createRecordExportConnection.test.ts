import { createRecordExportConnection } from '@/record-export/utils/createRecordExportConnection';
import { createClient, type ExecutionResult, type Sink } from 'graphql-sse';
import { type ExportRecordsSubscription } from '~/generated-metadata/graphql';

let mockSink: Sink<ExecutionResult<ExportRecordsSubscription>>;
const mockDispose = jest.fn();
let mockServerBaseUrl = 'https://workspace.example.test';

jest.mock('~/config', () => ({
  get REACT_APP_SERVER_BASE_URL() {
    return mockServerBaseUrl;
  },
}));

jest.mock('graphql-sse', () => ({
  createClient: jest.fn(() => ({
    dispose: mockDispose,
    subscribe: (_request: unknown, sink: typeof mockSink) => {
      mockSink = sink;
    },
  })),
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
  beforeEach(() => {
    jest.clearAllMocks();
    mockServerBaseUrl = 'https://workspace.example.test';
  });
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
      'https://workspace.example.test/file/record-export/export?token=token',
    );
    update({
      progress: 100,
      downloadUrl: '/file/record-export/export?token=token',
    });
    mockSink.complete();
    expect(click).toHaveBeenCalledTimes(1);
    expect(mockDispose).toHaveBeenCalledTimes(1);
  });

  it.each([
    'https://workspace.example.test',
    'https://custom-domain.example.test',
    'http://localhost:3000',
    'https://workspace.example.test/twenty',
    'http://localhost:3000/apps/twenty',
  ])('downloads through the authenticated API at %s', async (serverBaseUrl) => {
    mockServerBaseUrl = serverBaseUrl;
    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    const finished = createRecordExportConnection().exportRecords({ input });

    expect(createClient).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${serverBaseUrl}/metadata`,
        credentials: 'include',
      }),
    );
    update({
      progress: 100,
      downloadUrl:
        'https://api.example.test/file/record-export/export?token=signed%2Btoken',
    });

    await expect(finished).resolves.toBeUndefined();
    expect(click.mock.instances[0]).toHaveAttribute(
      'href',
      `${serverBaseUrl}/file/record-export/export?token=signed%2Btoken`,
    );
    expect(click.mock.instances[0]).toHaveAttribute('download', 'person.csv');
  });

  it.each([
    'https://api.example.test/file/record-export/export',
    'https://api.example.test/twenty/file/record-export/export',
    'https://api.example.test/canonical/file/record-export/export',
    '/file/record-export/export',
    '/twenty/file/record-export/export',
    'file/record-export/export',
  ])(
    'preserves the API base path when downloading %s',
    async (downloadPath) => {
      mockServerBaseUrl = 'https://workspace.example.test/twenty/';
      const click = jest
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => {});
      const finished = createRecordExportConnection().exportRecords({ input });

      update({
        progress: 100,
        downloadUrl: `${downloadPath}?token=signed%2Btoken%2Fvalue%3D&expires=123`,
      });

      await expect(finished).resolves.toBeUndefined();
      expect(click).toHaveBeenCalledTimes(1);
      expect(click.mock.instances[0]).toHaveAttribute(
        'href',
        'https://workspace.example.test/twenty/file/record-export/export?token=signed%2Btoken%2Fvalue%3D&expires=123',
      );
      expect(click.mock.instances[0]).toHaveAttribute('download', 'person.csv');
    },
  );

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
