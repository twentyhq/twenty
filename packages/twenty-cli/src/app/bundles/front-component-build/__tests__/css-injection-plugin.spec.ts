import { describe, expect, it } from 'vitest';

import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'path';

import * as esbuild from 'esbuild';

import { MINIMAL_APP_PATH } from '@/app/__tests__/utils/fixture-paths';
import { cssInjectionPlugin } from '@/app/bundles/front-component-build/css-injection-plugin';
import { collectWatchInputs } from '@/app/dev/collect-watch-inputs';
import { readWatchInputStamp } from '@/app/dev/read-watch-input-stamp';
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

  it('tracks nested stylesheets and assets for each build', async () => {
    const directory = await realpath(
      await mkdtemp(join(tmpdir(), 'component-css-watch-')),
    );

    try {
      const stylesheet = join(directory, 'style.css');
      const nestedStylesheet = join(directory, 'nested.css');
      const asset = join(directory, 'icon.svg');

      await writeFile(
        stylesheet,
        '@import "./nested.css"; .image { background: url("./icon.svg"); }',
      );
      await writeFile(nestedStylesheet, '.nested { color: purple; }');
      await writeFile(asset, '<svg xmlns="http://www.w3.org/2000/svg"/>');

      for (let buildIndex = 0; buildIndex < 2; buildIndex++) {
        const { watchInputs } = await collectWatchInputs(() =>
          esbuild.build({
            entryPoints: [stylesheet],
            bundle: true,
            write: false,
            plugins: [cssInjectionPlugin],
          }),
        );
        const files = watchInputs.filter((input) => input.kind === 'file');

        expect(files.map((input) => input.path)).toEqual(
          expect.arrayContaining([stylesheet, nestedStylesheet, asset]),
        );
        await writeFile(
          nestedStylesheet,
          `.nested { z-index: ${buildIndex}; }`,
        );
        await writeFile(asset, `<svg data-build="${buildIndex}"/>`);
        for (const file of files.filter((input) => input.path !== stylesheet)) {
          expect(readWatchInputStamp(file)).not.toBe(file.stamp);
        }
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
