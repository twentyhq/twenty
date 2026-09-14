import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { checkUiReferenceImports } from '../check-ui-reference-imports';

describe('UI reference imports', () => {
  let pagesDirectory: string;

  beforeEach(() => {
    pagesDirectory = mkdtempSync(join(tmpdir(), 'twenty-ui-pages-test-'));
    mkdirSync(join(pagesDirectory, 'components/input'), { recursive: true });
    writeFileSync(
      join(pagesDirectory, 'components/input/checkbox.mdx'),
      "---\ntitle: Checkbox\n---\n\nimport CheckboxReference from '/snippets/ui/generated/input/checkbox.mdx';\n\n<CheckboxReference />\n",
    );
    writeFileSync(
      join(pagesDirectory, 'tokens.mdx'),
      "import TokenReference from '/snippets/ui/generated/tokens.mdx'\n",
    );
  });

  afterEach(() => {
    rmSync(pagesDirectory, { recursive: true, force: true });
  });

  it('passes when every generated reference is imported by a page', () => {
    expect(
      checkUiReferenceImports({
        pagesDirectory,
        outputs: [{ name: 'input/checkbox.mdx' }, { name: 'tokens.mdx' }],
      }),
    ).toEqual([]);
  });

  it('reports pages importing missing references and references no page imports', () => {
    expect(
      checkUiReferenceImports({
        pagesDirectory,
        outputs: [{ name: 'input/switch.mdx' }, { name: 'tokens.mdx' }],
      }),
    ).toEqual([
      'Missing UI reference: components/input/checkbox.mdx imports input/checkbox.mdx, which is not generated.',
      'Unused UI reference: input/switch.mdx is not imported by any page.',
    ]);
  });
});
