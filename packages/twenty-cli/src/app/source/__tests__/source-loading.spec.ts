import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { stop } from 'esbuild';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';

import { extractDefineEntity } from '@/app/source/extract-define-entity';
import { extractManifestFromFile } from '@/app/source/extract-manifest-from-file';
import { readApplicationIdentity } from '@/app/source/read-application-identity';
import { scanProjectSourceFiles } from '@/app/source/scan-project-source-files';
import {
  createSourceTestApp,
  sourceApplication,
  SOURCE_TEST_APPLICATION_ID,
} from '@/app/source/__tests__/utils/create-source-test-app';

describe('CLI app source loading', () => {
  let appPath: string;
  let signal: AbortSignal;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-source-'));
    signal = new AbortController().signal;
    await createSourceTestApp(appPath);
  });

  afterEach(async () => rm(appPath, { recursive: true, force: true }));
  afterAll(async () => stop());

  it.each(['app.ts', 'src/app.ts'])(
    'finds %s, skips output and declarations, and does not execute helper files',
    async (appFile) => {
      await mkdir(join(appPath, 'src'), { recursive: true });
      await writeFile(join(appPath, appFile), sourceApplication());
      await writeFile(
        join(appPath, 'helper.ts'),
        'throw new Error("not a definition");',
      );

      for (const directory of [
        'dist',
        '.twenty',
        'node_modules/another-package',
      ]) {
        await mkdir(join(appPath, directory), { recursive: true });
        await writeFile(
          join(appPath, directory, 'app.ts'),
          sourceApplication(),
        );
      }

      await writeFile(join(appPath, 'extra.d.ts'), sourceApplication());
      expect(await readApplicationIdentity({ appPath, signal })).toEqual({
        application: {
          universalIdentifier: SOURCE_TEST_APPLICATION_ID,
          displayName: 'Source app',
        },
      });
      const files = await scanProjectSourceFiles({ appPath, signal });

      expect(files.map((file) => file.relativePath).sort()).toEqual(
        [appFile, 'helper.ts'].sort(),
      );
      expect(files.find((file) => file.relativePath === 'helper.ts')).toEqual({
        relativePath: 'helper.ts',
        entityKey: null,
        targetFunctionName: null,
        universalIdentifier: null,
        isReadable: true,
      });
    },
  );

  it('retains the supported default define-call syntax', () => {
    expect(
      extractDefineEntity(
        '// export default defineObject({});\nexport default defineApplication({});',
      ),
    ).toBe('defineApplication');
    for (const source of [
      'export default sdk.defineApplication({});',
      'const app = defineApplication({}); export default app;',
      'export = defineApplication({});',
      'export = defineObject({}); export default defineApplication({});',
      'export default renamedDefine({});',
      'function helper() { return defineApplication({}); }',
    ]) {
      expect(extractDefineEntity(source)).toBeUndefined();
    }
  });

  it('distinguishes missing, duplicate, and invalid application identities', async () => {
    expect(await readApplicationIdentity({ appPath, signal })).toEqual({
      application: null,
    });
    await writeFile(join(appPath, 'app.ts'), sourceApplication());
    await writeFile(join(appPath, 'other.ts'), sourceApplication());
    await expect(readApplicationIdentity({ appPath, signal })).rejects.toThrow(
      'more than one application',
    );
    await rm(join(appPath, 'other.ts'));
    await writeFile(
      join(appPath, 'app.ts'),
      sourceApplication().replace(SOURCE_TEST_APPLICATION_ID, 'not-a-uuid'),
    );
    await expect(readApplicationIdentity({ appPath, signal })).rejects.toThrow(
      'Could not read the application identifier in app.ts',
    );
  });

  it('evaluates imports and tsconfig aliases while preserving function-valued config in the worker', async () => {
    await mkdir(join(appPath, 'src'));
    await writeFile(
      join(appPath, 'src/constants.ts'),
      `export const identifier = '${SOURCE_TEST_APPLICATION_ID}';`,
    );
    await writeFile(
      join(appPath, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          baseUrl: '.',
          paths: { '@app/*': ['src/*'] },
        },
      }),
    );
    await writeFile(
      join(appPath, 'function.ts'),
      `
      import { defineLogicFunction } from 'twenty-sdk/define';
      import { identifier } from '@app/constants';
      export default defineLogicFunction({ universalIdentifier: identifier, handler: () => 'kept' });
    `,
    );
    const files = await scanProjectSourceFiles({
      appPath,
      signal,
      includeConfig: true,
    });

    expect(
      files.find((file) => file.relativePath === 'function.ts'),
    ).toMatchObject({
      entityKey: 'logicFunctions',
      universalIdentifier: SOURCE_TEST_APPLICATION_ID,
      isReadable: true,
      config: { handler: expect.any(Function) },
    });
  });

  it('mocks UI and generated clients and converts conditional availability without evaluating the expression', async () => {
    await writeFile(
      join(appPath, 'command.ts'),
      `
      import { defineCommandMenuItem } from 'twenty-sdk/define';
      import { IconTest } from 'twenty-ui/icon';
      import { CoreApiClient } from 'twenty-client-sdk/core';
      import { MetadataApiClient } from 'twenty-client-sdk/metadata';
      export default defineCommandMenuItem({
        universalIdentifier: '${SOURCE_TEST_APPLICATION_ID}',
        component: () => { new CoreApiClient(); new MetadataApiClient(); return IconTest; },
        conditionalAvailabilityExpression: selectedRecords.length === 1 && !isSelected,
      });
    `,
    );
    const result = await extractManifestFromFile({
      appPath,
      filePath: join(appPath, 'command.ts'),
    });

    expect(result.config.conditionalAvailabilityExpression).toBe(
      'arrayLength(selectedRecords) == 1 and not isSelected',
    );
    expect(result.config.component).toBeTypeOf('function');
  });

  it('keeps an unreadable definition occupied and preserves config even when SDK validation fails', async () => {
    await writeFile(
      join(appPath, 'broken.ts'),
      'export default defineObject({broken: });',
    );
    const sdkPath = join(appPath, 'node_modules/twenty-sdk/define.cjs');

    await writeFile(
      sdkPath,
      (await readFile(sdkPath, 'utf8')).replace(
        'success: true, config, errors: []',
        'success: false, config, errors: ["missing label"]',
      ),
    );
    await writeFile(
      join(appPath, 'object.ts'),
      `
      import { defineObject } from 'twenty-sdk/define';
      export default defineObject({ universalIdentifier: '${SOURCE_TEST_APPLICATION_ID}' });
    `,
    );
    const files = await scanProjectSourceFiles({
      appPath,
      signal,
      includeConfig: true,
    });

    expect(
      files.find((file) => file.relativePath === 'broken.ts'),
    ).toMatchObject({
      entityKey: 'objects',
      isReadable: false,
      universalIdentifier: null,
    });
    expect(
      files.find((file) => file.relativePath === 'object.ts'),
    ).toMatchObject({
      entityKey: 'objects',
      isReadable: true,
      universalIdentifier: SOURCE_TEST_APPLICATION_ID,
    });
  });

  it('reports an incompatible SDK return shape instead of treating it as unreadable source', async () => {
    await writeFile(
      join(appPath, 'node_modules/twenty-sdk/define.cjs'),
      'exports.defineApplication = (config) => config;',
    );
    await writeFile(join(appPath, 'app.ts'), sourceApplication());
    await expect(
      scanProjectSourceFiles({ appPath, signal }),
    ).rejects.toMatchObject({ code: 'SDK_SOURCE_UNSUPPORTED' });
  });

  it('reloads edited source without using a stale compiled wrapper', async () => {
    await writeFile(join(appPath, 'app.ts'), sourceApplication());
    await readApplicationIdentity({ appPath, signal });
    await writeFile(
      join(appPath, 'app.ts'),
      sourceApplication().replace('Source app', 'Changed app'),
    );
    expect(await readApplicationIdentity({ appPath, signal })).toMatchObject({
      application: { displayName: 'Changed app' },
    });
  });

  it('loads the repository SDK and a real React component importing UI CSS', async () => {
    const fixturePath = fileURLToPath(
      new URL(
        '../../../../../twenty-apps/fixtures/minimal-app/',
        import.meta.url,
      ),
    );
    const identity = await readApplicationIdentity({
      appPath: fixturePath,
      signal,
    });
    const component = await extractManifestFromFile({
      appPath: fixturePath,
      filePath: join(fixturePath, 'my.front-component.tsx'),
    });

    expect(identity.application?.displayName).toBe('Root App');
    expect(component.errors).toEqual([]);
    expect(component.config.universalIdentifier).toBe(
      'e1e2e3e4-e5e6-4000-8000-000000000020',
    );
    expect(component.config.component).toBeTypeOf('function');
  }, 30_000);
});
