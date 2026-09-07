import { describe, expect, test } from 'vitest';

import { prettify } from '../../genql/helpers/prettify';
import { RenderContext } from '../../genql/render/common/RenderContext';

// Port of remorses/genql@v3.0.5
// cli/src/render/common/__tests__/RenderContext.test.ts; `toCode` and
// `prettify` are awaited since the prettier 3 migration made them async.
describe('RenderContext', () => {
  test('prettify', async () => {
    const renderContext = new RenderContext();
    renderContext.addCodeBlock('interface A{}');
    expect(await renderContext.toCode('typescript', true)).toBe(
      await prettify('interface A{}', 'typescript'),
    );
  });

  test('raw', async () => {
    const renderContext = new RenderContext();
    renderContext.addCodeBlock('raw string');
    expect(await renderContext.toCode()).toBe('raw string');
  });
});
