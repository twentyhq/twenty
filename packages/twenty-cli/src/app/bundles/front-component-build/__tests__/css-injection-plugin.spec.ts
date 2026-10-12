import { describe, expect, it } from 'vitest';

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'path';

import * as esbuild from 'esbuild';

import { MINIMAL_APP_PATH } from '@/app/__tests__/utils/fixture-paths';
import { getBaseFrontComponentBuildOptions } from '@/app/bundles/front-component-build/utils/get-base-front-component-build-options';

describe('front-component build CSS injection', () => {
  it('bundles relative CSS imports and assets into the injected style', async () => {
    const appPath = await mkdtemp(join(tmpdir(), 'css-assets-'));

    try {
      await writeFile(
        join(appPath, 'main.js'),
        "import './main.css'; export const text = `line one\n// keep this text\n/* and this text */`;",
      );
      await writeFile(
        join(appPath, 'main.css'),
        '@import "./nested.css"; .image { background: url("./icon.svg"); }',
      );
      await writeFile(
        join(appPath, 'nested.css'),
        '.nested { color: purple; }',
      );
      await writeFile(
        join(appPath, 'icon.svg'),
        '<svg xmlns="http://www.w3.org/2000/svg"/>',
      );
      const result = await esbuild.build({
        ...getBaseFrontComponentBuildOptions(),
        entryPoints: [join(appPath, 'main.js')],
        write: false,
        sourcemap: false,
      });
      const source = result.outputFiles[0].text;
      const styles: { textContent?: string }[] = [];
      const document = {
        createElement: () => ({}),
        head: {
          appendChild: (style: { textContent?: string }) => styles.push(style),
        },
      };
      const evaluated = new Function(
        'document',
        source.replace(/export\s*\{[^}]*\};?\s*$/, ''),
      );
      evaluated(document);

      expect(styles[0].textContent).toContain('.nested');
      expect(styles[0].textContent).toContain('data:image/svg+xml');
      expect(styles[0].textContent).not.toContain('@import');
      expect(source).toContain('// keep this text');
      expect(source).toContain('/* and this text */');
    } finally {
      await rm(appPath, { recursive: true, force: true });
    }
  });

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
