import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';

describe('HttpTool', () => {
  let httpTool: HttpTool;
  let mockHttpClient: jest.Mock;
  let mockSecureHttpClientService: jest.Mocked<SecureHttpClientService>;
  const mockContext: ToolExecutionContext = {
    workspaceId: 'ws-123',
    userId: 'user-123',
  };

  beforeEach(() => {
    mockHttpClient = jest.fn().mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: { success: true },
      headers: {},
    });

    mockSecureHttpClientService = {
      getHttpClient: jest.fn().mockReturnValue(mockHttpClient),
    } as unknown as jest.Mocked<SecureHttpClientService>;

    httpTool = new HttpTool(mockSecureHttpClientService);
  });

  it('should preserve 0 and false bodies on POST requests', async () => {
    await httpTool.execute(
      {
        url: 'https://api.example.com/test',
        method: 'POST',
        body: 0,
        headers: { 'content-type': 'application/json' },
      },
      mockContext,
    );

    expect(mockHttpClient).toHaveBeenCalledWith(
      expect.objectContaining({
        data: '0',
      }),
    );

    await httpTool.execute(
      {
        url: 'https://api.example.com/test',
        method: 'POST',
        body: false,
        headers: { 'content-type': 'application/json' },
      },
      mockContext,
    );

    expect(mockHttpClient).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'false',
      }),
    );
  });

  it('should serialize form urlencoded body with case-insensitive Content-Type header', async () => {
    await httpTool.execute(
      {
        url: 'https://api.example.com/form',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: { name: 'Alice & Bob', count: 0 },
      },
      mockContext,
    );

    expect(mockHttpClient).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'name=Alice+%26+Bob&count=0',
      }),
    );
  });

  it('should delete Content-Type header case-insensitively for multipart/form-data', async () => {
    await httpTool.execute(
      {
        url: 'https://api.example.com/upload',
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: { description: 'test upload' },
      },
      mockContext,
    );

    const calledConfig = mockHttpClient.mock.calls[0][0];

    expect(calledConfig.headers['Content-Type']).toBeUndefined();
    expect(calledConfig.headers['content-type']).toBeUndefined();
    expect(calledConfig.data).toBeInstanceOf(FormData);
  });
});
