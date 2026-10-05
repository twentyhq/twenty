import { describe, expect, it } from 'vitest';

import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'path';

import * as esbuild from 'esbuild';

import { MINIMAL_APP_PATH } from '@/app/__tests__/utils/fixture-paths';
import { getBaseFrontComponentBuildOptions } from '@/app/bundles/front-component-build/utils/get-base-front-component-build-options';

describe('front-component build CSS injection', () => {
  it('inlines an imported twenty-ui/style.css as a runtime document.head style injection', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'css-injection-'));

    try {
      await esbuild.build({
        ...getBaseFrontComponentBuildOptions(),
        entryPoints: [join(MINIMAL_APP_PATH, 'my.front-component.tsx')],
        outdir: outputDir,
      });

      const output = await readFile(
        join(outputDir, 'my.front-component.mjs'),
        'utf-8',
      );

      expect(output).toContain('document.createElement("style")');
      expect(output).toContain('document.head.appendChild');
      expect(output).toContain('box-sizing');
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  }, 30000);
});
