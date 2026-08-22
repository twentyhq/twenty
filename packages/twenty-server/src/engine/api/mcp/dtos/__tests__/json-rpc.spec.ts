import { type ArgumentMetadata, ValidationPipe } from '@nestjs/common';

import { JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';

describe('JsonRpc', () => {
  // Mirrors the pipe configured on McpCoreController
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  const metadata: ArgumentMetadata = { type: 'body', metatype: JsonRpc };

  it('should keep params._meta so the client progress token reaches the tool executor', async () => {
    const body = await pipe.transform(
      {
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 4,
        params: {
          name: 'learn_tools',
          arguments: { toolNames: [] },
          _meta: { progressToken: 4 },
        },
      },
      metadata,
    );

    expect(body.params?._meta?.progressToken).toBe(4);
  });

  it('should strip unknown top-level properties', async () => {
    await expect(
      pipe.transform(
        {
          jsonrpc: '2.0',
          method: 'ping',
          id: 1,
          unexpected: 'value',
        },
        metadata,
      ),
    ).rejects.toThrow();
  });
});
