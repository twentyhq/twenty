import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import { PageLayoutTabLayoutMode, WidgetType } from 'twenty-shared/types';

import { assertPullSdkExports } from '@/app/pull/assert-pull-sdk-exports';
import {
  PAGE_LAYOUT_WIDGET_ENUM_BINDINGS,
  writeDefineFile,
} from '@/app/pull/write-define-file';

const appPaths: string[] = [];

afterEach(async () => {
  await Promise.all(
    appPaths
      .splice(0)
      .map((appPath) => rm(appPath, { recursive: true, force: true })),
  );
});

describe('SDK exports required by generated source', () => {
  it.each([false, true])(
    'checks imports emitted by the writer, wrapped: %s',
    async (wrapped) => {
      const appPath = await mkdtemp(join(tmpdir(), 'twenty-pull-sdk-'));
      appPaths.push(appPath);
      const sdkPath = join(appPath, 'node_modules/twenty-sdk');
      await mkdir(sdkPath, { recursive: true });
      await writeFile(join(appPath, 'package.json'), '{}');
      await writeFile(
        join(sdkPath, 'package.json'),
        JSON.stringify({
          name: 'twenty-sdk',
          exports: { './define': './define.cjs' },
        }),
      );
      await writeFile(
        join(sdkPath, 'define.cjs'),
        'exports.definePageLayoutWidget = () => {}; exports.WidgetType = {};',
      );

      const { content, requiredSdkExports } = writeDefineFile(
        wrapped
          ? {
              definer: 'definePageLayoutWidget',
              config: {
                type: WidgetType.GRAPH,
                position: { layoutMode: PageLayoutTabLayoutMode.GRID },
              },
              enumBindings: PAGE_LAYOUT_WIDGET_ENUM_BINDINGS,
            }
          : { definer: 'defineApplication', config: {} },
      );
      expect(content.startsWith('import {\n')).toBe(wrapped);
      try {
        assertPullSdkExports({
          appPath,
          writes: [
            {
              requiredSdkExports,
            },
          ],
        });
        expect.fail('Expected a missing authoring export');
      } catch (error) {
        expect(error).toMatchObject({
          code: 'SDK_SOURCE_UNSUPPORTED',
          details: {
            missingNames: [
              wrapped ? 'PageLayoutTabLayoutMode' : 'defineApplication',
            ],
          },
        });
      }
    },
  );
});
