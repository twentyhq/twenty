import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type AppApplyResult } from '@/app/deployment/apply-app-build';
import { type BuiltDevSnapshot } from '@/app/dev/build-dev-snapshot';
import { createDevClientGenerator } from '@/app/dev/generate-dev-client';
import {
  fetchAppClientSchema,
  generateAppClientFromSchema,
} from '@/app/generate-app-client';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';

vi.mock('@/app/generate-app-client');

let appPath: string;
let controller: AbortController;
let context: TargetCommandContext;
let applied: AppApplyResult;
const snapshot: BuiltDevSnapshot = {
  contentHash: 'hash',
  build: {
    buildId: 'build',
    contentHash: 'hash',
    application: {
      name: 'test',
      displayName: 'Test',
      universalIdentifier: 'id',
    },
    manifestFormat: 'twenty-application',
    manifest: {},
    files: [],
    directory: '/snapshot',
  },
  diagnostics: [],
  tooling: {
    version: '2.44.0',
    packagePath: '/sdk',
  },
  sourceFingerprints: {},
  release: async () => {},
};
const invalidate = vi.fn();
let isPaused = false;
const withBuildsPaused = async <TResult>(run: () => Promise<TResult>) => {
  isPaused = true;
  try {
    return await run();
  } finally {
    isPaused = false;
  }
};

beforeEach(async () => {
  appPath = await mkdtemp(join(tmpdir(), 'dev-client-'));
  await mkdir(join(appPath, 'node_modules/twenty-client-sdk'), {
    recursive: true,
  });
  await writeFile(
    join(appPath, 'node_modules/twenty-client-sdk/package.json'),
    '{"name":"twenty-client-sdk","version":"2.44.0","exports":{"./generate":"./generate.cjs"}}',
  );
  await writeFile(
    join(appPath, 'node_modules/twenty-client-sdk/generate.cjs'),
    'module.exports = {};',
  );
  controller = new AbortController();
  context = {
    command: 'app dev',
    arguments: [],
    options: {},
    outputMode: 'ndjson',
    signal: controller.signal,
    target: {
      apiUrl: 'http://localhost:3000',
      bearerToken: 'test',
      credentialKind: 'apiKey',
      source: 'environment',
    },
    output: {
      event: vi.fn(),
      progress: vi.fn(),
      warn: vi.fn(),
      succeed: vi.fn(),
      fail: vi.fn(),
    },
  };
  applied = {
    completedPhases: ['sync', 'pullBase'],
    isRegistrationCreated: false,
    appliedActions: [],
    acknowledgedUniversalIdentifier: 'id',
    upload: { fileCount: 0, byteCount: 0, hasCreatedTargets: false },
  };
  vi.mocked(fetchAppClientSchema).mockResolvedValue('schema');
  vi.mocked(generateAppClientFromSchema).mockImplementation(async () => {
    expect(isPaused).toBe(true);
    return [];
  });
});
afterEach(async () => {
  vi.resetAllMocks();
  await rm(appPath, { recursive: true, force: true });
});

describe('dev client generation', () => {
  it('quiesces builds and avoids generation loops using schema and installed generator identity', async () => {
    const generate = createDevClientGenerator({ appPath });
    const options = {
      snapshot,
      applied,
      context,
      withBuildsPaused,
      invalidate,
    };
    expect(await generate(options)).toBe('generated');
    expect(await generate(options)).toBe('unchanged');
    expect(generateAppClientFromSchema).toHaveBeenCalledOnce();
    await mkdir(join(appPath, 'node_modules/twenty-client-sdk/dist'), {
      recursive: true,
    });
    await writeFile(
      join(appPath, 'node_modules/twenty-client-sdk/dist/core.cjs'),
      'reinstalled stub',
    );
    expect(await generate(options)).toBe('generated');
    expect(await generate(options)).toBe('unchanged');
    await writeFile(
      join(appPath, 'node_modules/twenty-client-sdk/package.json'),
      '{"name":"twenty-client-sdk","version":"2.45.0","exports":{"./generate":"./generate.cjs"}}',
    );
    expect(await generate(options)).toBe('generated');
    vi.mocked(fetchAppClientSchema).mockResolvedValue('new schema');
    expect(await generate(options)).toBe('generated');
    expect(invalidate).toHaveBeenCalledTimes(4);
  });

  it('regenerates after generator bytes or a nested generated file change', async () => {
    const generate = createDevClientGenerator({ appPath });
    const options = {
      snapshot,
      applied,
      context,
      withBuildsPaused,
      invalidate,
    };
    const packageRoot = join(appPath, 'node_modules/twenty-client-sdk');
    const directory = join(packageRoot, 'dist/core/generated/models');

    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'company.ts'), 'original');
    expect(await generate(options)).toBe('generated');
    expect(await generate(options)).toBe('unchanged');
    await writeFile(join(directory, 'company.ts'), 'modified');
    expect(await generate(options)).toBe('generated');
    await writeFile(
      join(packageRoot, 'generate.cjs'),
      'module.exports = { rebuilt: true };',
    );
    expect(await generate(options)).toBe('generated');
    expect(await generate(options)).toBe('unchanged');
  });

  it('keeps the old client on schema failure and does not cache a failed attempt', async () => {
    const generate = createDevClientGenerator({ appPath });
    vi.mocked(fetchAppClientSchema).mockRejectedValueOnce(
      new Error('network failure'),
    );
    const options = {
      snapshot,
      applied,
      context,
      withBuildsPaused,
      invalidate,
    };
    expect(await generate(options)).toBe('skipped');
    expect(generateAppClientFromSchema).not.toHaveBeenCalled();
    expect(invalidate).not.toHaveBeenCalled();
    expect(context.output.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('previous client was kept'),
      }),
    );
    expect(await generate(options)).toBe('generated');
  });

  it('reports applied phases and incomplete files after a generation failure', async () => {
    const generate = createDevClientGenerator({ appPath });
    vi.mocked(generateAppClientFromSchema).mockRejectedValueOnce(
      new Error('disk full'),
    );
    await expect(
      generate({ snapshot, applied, context, withBuildsPaused, invalidate }),
    ).rejects.toMatchObject({
      details: {
        phase: 'clientGeneration',
        outcome: 'applied',
        completedPhases: ['sync', 'pullBase'],
      },
      hint: expect.stringContaining('may be incomplete'),
    });
    expect(invalidate).not.toHaveBeenCalled();
    expect(isPaused).toBe(false);
  });
  it('keeps applied phases when cancelled while waiting for the compiler to pause, before client writes', async () => {
    const generate = createDevClientGenerator({ appPath });
    const withCancelledPause = async () => {
      controller.abort();
      throw controller.signal.reason;
    };
    await expect(
      generate({
        snapshot,
        applied,
        context,
        withBuildsPaused: withCancelledPause,
        invalidate,
      }),
    ).rejects.toMatchObject({
      code: 'CANCELLED',
      details: { phase: 'clientGeneration', outcome: 'applied' },
      hint: expect.stringContaining('previous typed API client was kept'),
    });
    expect(generateAppClientFromSchema).not.toHaveBeenCalled();
  });
});
