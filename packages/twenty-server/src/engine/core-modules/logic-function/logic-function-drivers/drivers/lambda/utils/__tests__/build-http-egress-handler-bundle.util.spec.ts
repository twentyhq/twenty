import { mkdtemp, rm, writeFile } from 'fs/promises';
import { createRequire } from 'module';
import { tmpdir } from 'os';
import { join } from 'path';

import { buildHttpEgressHandlerBundle } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-http-egress-handler-bundle.util';
import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';
import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';

type BundledHandler = (
  request: HttpEgressRequest,
) => Promise<HttpEgressResponse>;

describe('buildHttpEgressHandlerBundle', () => {
  let bundleDirectory: string;
  let handler: BundledHandler;

  beforeAll(async () => {
    jest.useRealTimers();

    const code = await buildHttpEgressHandlerBundle();

    bundleDirectory = await mkdtemp(join(tmpdir(), 'http-egress-bundle-'));
    await writeFile(join(bundleDirectory, 'index.js'), code);

    handler = createRequire(__filename)(
      join(bundleDirectory, 'index.js'),
    ).handler;
  }, 60_000);

  afterAll(async () => {
    await rm(bundleDirectory, { recursive: true, force: true });
  });

  it.each([
    [
      'the Lambda Runtime API on loopback',
      'http://127.0.0.1:9001/2018-06-01/runtime/invocation/next',
    ],
    [
      'the instance metadata endpoint',
      'http://169.254.169.254/latest/meta-data/',
    ],
    ['a private network address', 'http://10.0.0.1/'],
    ['a hex-encoded loopback address', 'http://0x7f000001/'],
  ])('blocks %s even though nothing is allowlisted', async (_label, url) => {
    const { errorMessage, outcomeDetails } = await handler({
      input: { url, method: 'GET' },
      limits: { timeoutMs: 2_000, maxPayloadSizeBytes: 1024 },
      context: { workspaceId: 'workspace-id', source: 'workflow-http' },
    });

    expect(errorMessage).toMatch(/is not allowed/);
    expect(outcomeDetails.outcome).toBe('blocked');
  });
});
