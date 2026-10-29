import {
  access,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'fs/promises';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { PageLayoutType } from 'twenty-shared/types';
import { ZodError } from 'zod';

import { LocalDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local.driver';
import { type LocalDriverOptions } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/types/local-driver.type';
import { frontComponentBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-build-result.schema';
import { frontComponentDependenciesBuildResultSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-dependencies-build-result.schema';
import { type FrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-builder-request.type';
import { executeFrontComponentBuilderRequest } from 'src/engine/metadata-modules/ai/ai-front-component/utils/execute-front-component-builder-request.util';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const mockBuilderOptions = {
  buildAssetsDirectory: '',
  yarnEngineDirectory: '',
  timeoutMs: 30000,
};

jest.mock(
  'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-builder-directory.constant',
  () => ({
    get FRONT_COMPONENT_BUILDER_DIRECTORY() {
      return mockBuilderOptions.buildAssetsDirectory;
    },
  }),
);
jest.mock(
  'src/engine/core-modules/application/application-package/constants/yarn-engine-dirname',
  () => ({
    get YARN_ENGINE_DIRNAME() {
      return mockBuilderOptions.yarnEngineDirectory;
    },
  }),
);
jest.mock(
  'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant',
  () => ({
    ...jest.requireActual(
      'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant',
    ),
    get BUILDER_LAMBDA_TIMEOUT_SECONDS() {
      return mockBuilderOptions.timeoutMs / 1000;
    },
    get YARN_INSTALL_LAMBDA_TIMEOUT_SECONDS() {
      return mockBuilderOptions.timeoutMs / 1000;
    },
  }),
);

const invokeFrontComponentBuilderLocally = async ({
  input,
  buildAssetsDirectory,
  yarnEngineDirectory,
  timeoutMs,
}: {
  input: FrontComponentBuilderRequest;
  buildAssetsDirectory: string;
  yarnEngineDirectory: string;
  timeoutMs: number;
}) => {
  Object.assign(mockBuilderOptions, {
    buildAssetsDirectory,
    yarnEngineDirectory,
    timeoutMs,
  });
  const driver = new LocalDriver({} as LocalDriverOptions);
  const request = {
    ...input,
    workspaceId: 'workspace',
    targetRuntime: 'browser' as const,
  };
  return request.action === 'buildDependencies'
    ? driver.buildDependencies(request)
    : driver.transpile(request);
};

const charMap: Record<string, string> = {
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\\': '\\\\',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\0': '\\0',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

const escapeUnsafeChars = (value: string): string =>
  value.replace(/[<>\/\\\b\f\n\r\t\0\u2028\u2029]/g, (char) => charMap[char]);

jest.useRealTimers();

const PACKAGE_JSON = '{"name":"local-build-fixture","private":true}\n';
const YARN_LOCK = '# exact app-owned lock bytes\n';
const INPUT = {
  componentId: 'local-component',
  name: 'Local component',
  source: 'export const Component = () => <div>Built locally</div>;',
  query: { objectName: 'company', select: ['name'], limit: 20 },
  pageLayoutType: PageLayoutType.DASHBOARD as const,
};

describe('LocalDriver', () => {
  it.each([LogicFunctionRuntime.NODE18, LogicFunctionRuntime.NODE22])(
    'builds Node code for %s with package imports external',
    async (targetRuntime) => {
      const driver = new LocalDriver({} as LocalDriverOptions);
      const result = await driver.transpile({
        targetRuntime,
        sourceCode:
          'import { value } from "external-package"; export const handler = (input: number) => value + input;',
        sourceFileName: 'src/handler.ts',
        builtFileName: 'dist/handler.mjs',
      });
      expect(result.builtCode).toContain('from "external-package"');
      expect(result.builtCode).toContain('sourceMappingURL=handler.mjs.map');
      expect(result.builtCode).not.toContain('input: number');
    },
  );

  let directory: string;
  let buildAssetsDirectory: string;
  let yarnEngineDirectory: string;

  const invoke = (input: FrontComponentBuilderRequest) =>
    invokeFrontComponentBuilderLocally({
      input,
      buildAssetsDirectory,
      yarnEngineDirectory,
      timeoutMs: 30_000,
    });

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), 'local-builder-test-'));
    buildAssetsDirectory = join(directory, 'assets');
    yarnEngineDirectory = join(directory, 'yarn-engine');
    await mkdir(join(yarnEngineDirectory, '.yarn/releases'), {
      recursive: true,
    });
    await mkdir(buildAssetsDirectory);
    await copyFile(
      require.resolve('src/engine/metadata-modules/ai/ai-front-component/constants/builder/index.mjs'),
      join(buildAssetsDirectory, 'index.mjs'),
    );
    await copyFile(
      require.resolve('src/engine/core-modules/application/application-package/constants/yarn-engine/install-yarn-dependencies.cjs'),
      join(yarnEngineDirectory, 'install-yarn-dependencies.cjs'),
    );
    await writeFile(
      join(yarnEngineDirectory, '.yarn/releases/yarn-4.9.2.cjs'),
      `const fs = require('node:fs');
const assert = require('node:assert/strict');
fs.writeFileSync(${JSON.stringify(join(directory, 'install-directory'))}, process.cwd());
assert.equal(fs.readFileSync('package.json', 'utf8'), ${JSON.stringify(PACKAGE_JSON)});
assert.equal(fs.readFileSync('yarn.lock', 'utf8'), ${JSON.stringify(YARN_LOCK)});
assert.ok(process.argv.includes('--immutable'));
fs.symlinkSync(${JSON.stringify(dirname(dirname(require.resolve('react/package.json'))))}, 'node_modules', 'junction');`,
    );
  }, 30_000);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('builds the stored dependency pair and matches the Lambda component output', async () => {
    const vendor = frontComponentDependenciesBuildResultSchema.parse(
      await invoke({
        action: 'buildDependencies',
        packageJson: PACKAGE_JSON,
        yarnLock: YARN_LOCK,
      }),
    );

    if (!vendor.success) {
      throw new Error(vendor.error);
    }
    const request: FrontComponentBuilderRequest = {
      action: 'transpile',
      input: INPUT,
      manifest: { checksum: vendor.checksum, exports: vendor.exports },
    };
    const result = frontComponentBuildResultSchema.parse(await invoke(request));

    expect(result).toEqual(
      await executeFrontComponentBuilderRequest({
        input: request,
        yarnEngineDirectory,
      }),
    );
    expect(result).toMatchObject({
      success: true,
      sharedDependenciesChecksum: vendor.checksum,
      builtCode: expect.stringContaining('Built locally'),
    });
    const installDirectory = await readFile(
      join(directory, 'install-directory'),
      'utf8',
    );

    await expect(access(installDirectory)).rejects.toThrow();
    await expect(access(dirname(installDirectory))).rejects.toThrow();
  }, 30_000);

  it('returns the same invalid-input diagnostics as Lambda', async () => {
    const request: FrontComponentBuilderRequest = {
      action: 'transpile',
      input: { ...INPUT, source: 'export default () => <div />;' },
      manifest: { checksum: 'a'.repeat(64), exports: {} },
    };
    const result = await invoke(request);

    expect(result).toEqual(
      await executeFrontComponentBuilderRequest({
        input: request,
        yarnEngineDirectory,
      }),
    );
    expect(result).not.toHaveProperty('userFriendlyMessage');
    expect(result).toMatchObject({
      success: false,
      code: 'INVALID_INPUT',
    });
  });

  it('delivers responses larger than an IPC pipe buffer and removes the working directory', async () => {
    jest.replaceProperty(process, 'env', {
      ...process.env,
      NODE_OPTIONS: '--require=/missing-server-loader.cjs',
    });
    const assets = join(directory, 'large-response');
    const workingDirectoryFile = join(directory, 'large-response-directory');

    await mkdir(assets);
    await writeFile(
      join(assets, 'index.mjs'),
      `import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export const handler = () => {
  require('node:fs').writeFileSync(${JSON.stringify(workingDirectoryFile)}, process.cwd());
  return { success: true, builtCode: 'x'.repeat(2 * 1024 * 1024), checksum: 'a'.repeat(64), exports: {} };
};`,
    );
    const result = frontComponentDependenciesBuildResultSchema.parse(
      await invokeFrontComponentBuilderLocally({
        input: { action: 'buildDependencies', packageJson: '', yarnLock: '' },
        buildAssetsDirectory: assets,
        yarnEngineDirectory,
        timeoutMs: 5000,
      }),
    );

    if (!result.success) {
      throw new Error(result.error);
    }

    expect(result.builtCode).toHaveLength(2 * 1024 * 1024);
    const workingDirectory = await readFile(workingDirectoryFile, 'utf8');

    await expect(access(workingDirectory)).rejects.toThrow();
  });

  it.each([
    {
      description: 'an invalid failure code',
      action: 'buildDependencies',
      response: { success: false, error: 'Build failed', code: 'UNKNOWN' },
    },
    {
      description: 'a component response to a dependency build',
      action: 'buildDependencies',
      response: {
        success: true,
        builtCode: 'compiled component',
        checksum: 'a'.repeat(64),
        sharedDependenciesChecksum: 'b'.repeat(64),
      },
    },
    {
      description: 'a dependency response to a component build',
      action: 'transpile',
      response: {
        success: true,
        builtCode: 'compiled dependencies',
        checksum: 'a'.repeat(64),
        exports: {},
      },
    },
  ] as const)(
    'rejects $description and removes the working directory',
    async ({ description, action, response }) => {
      const assets = join(directory, description);
      const workingDirectoryFile = join(assets, 'working-directory');
      const input: FrontComponentBuilderRequest =
        action === 'buildDependencies'
          ? { action, packageJson: PACKAGE_JSON, yarnLock: YARN_LOCK }
          : {
              action,
              input: INPUT,
              manifest: { checksum: 'a'.repeat(64), exports: {} },
            };

      await mkdir(assets);
      await writeFile(
        join(assets, 'index.mjs'),
        `import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export const handler = () => {
  require('node:fs').writeFileSync(${JSON.stringify(workingDirectoryFile)}, process.cwd());
  return ${JSON.stringify(response)};
};`,
      );

      await expect(
        invokeFrontComponentBuilderLocally({
          input,
          buildAssetsDirectory: assets,
          yarnEngineDirectory,
          timeoutMs: 5000,
        }),
      ).rejects.toBeInstanceOf(ZodError);
      const workingDirectory = await readFile(workingDirectoryFile, 'utf8');

      await expect(access(workingDirectory)).rejects.toThrow();
    },
  );

  it('surfaces builder failures instead of waiting for the timeout', async () => {
    await expect(
      invoke({ action: 'buildDependencies', packageJson: '{}', yarnLock: '' }),
    ).rejects.toThrow('ERR_ASSERTION');
    const installDirectory = await readFile(
      join(directory, 'install-directory'),
      'utf8',
    );

    await expect(access(installDirectory)).rejects.toThrow();
    await expect(access(dirname(installDirectory))).rejects.toThrow();
  });

  it('stops a timed-out build and removes its temporary directory', async () => {
    const assets = join(directory, 'timeout');
    const workingDirectoryFile = join(directory, 'timeout-directory');
    const heartbeatFile = join(directory, 'descendant-heartbeat');
    const descendantSource = `setInterval(() => require('node:fs').appendFileSync(${escapeUnsafeChars(JSON.stringify(heartbeatFile))}, 'x'), 20);`;

    await mkdir(assets);
    await writeFile(
      join(assets, 'index.mjs'),
      `import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export const handler = () => new Promise(() => {
require('node:fs').writeFileSync(${JSON.stringify(workingDirectoryFile)}, process.cwd());
if (process.platform !== 'win32') {
  require('node:child_process').spawn(process.execPath, ['-e', ${JSON.stringify(descendantSource)}]);
}
setInterval(() => {}, 1000);
});`,
    );
    await expect(
      invokeFrontComponentBuilderLocally({
        input: { action: 'buildDependencies', packageJson: '', yarnLock: '' },
        buildAssetsDirectory: assets,
        yarnEngineDirectory,
        timeoutMs: 1000,
      }),
    ).rejects.toThrow('Timed out');
    const workingDirectory = await readFile(workingDirectoryFile, 'utf8');

    await expect(access(workingDirectory)).rejects.toThrow();
    if (process.platform !== 'win32') {
      const heartbeat = await readFile(heartbeatFile, 'utf8');

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(await readFile(heartbeatFile, 'utf8')).toBe(heartbeat);
    }
  });
});
