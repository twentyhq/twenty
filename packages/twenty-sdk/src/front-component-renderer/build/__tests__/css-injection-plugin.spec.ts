import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

import { build } from 'esbuild';
import { vi } from 'vitest';

import { cssInjectionPlugin } from '@/front-component-renderer/build/css-injection-plugin';

describe('front-component build CSS injection', () => {
  it('injects imported CSS into the document head and supports server rendering', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'css-injection-'));
    const css = String.raw`.example::before {
  content: "hello\\world";
  box-sizing: border-box;
}
`;

    try {
      await writeFile(join(directory, 'style.css'), css);
      await writeFile(join(directory, 'component.js'), "import './style.css';");

      const result = await build({
        entryPoints: [join(directory, 'component.js')],
        bundle: true,
        write: false,
        plugins: [cssInjectionPlugin],
      });
      const style = { textContent: '' };
      const createElement = vi.fn(() => style);
      const appendChild = vi.fn();

      runInNewContext(result.outputFiles[0].text, {
        document: { createElement, head: { appendChild } },
      });

      expect(createElement).toHaveBeenCalledWith('style');
      expect(appendChild).toHaveBeenCalledWith(style);
      expect(style.textContent).toContain(css);
      expect(() => runInNewContext(result.outputFiles[0].text)).not.toThrow();
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
