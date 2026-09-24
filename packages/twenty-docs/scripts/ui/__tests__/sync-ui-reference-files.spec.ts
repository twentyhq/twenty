import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { syncUiReferenceFiles } from '../sync-ui-reference-files';

describe('generated UI reference files', () => {
  let directory: string;
  const outputs = [
    { name: 'input/current.mdx', content: 'Current reference\n' },
  ];

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'twenty-ui-reference-test-'));
    mkdirSync(join(directory, 'input'));
    writeFileSync(join(directory, 'input/obsolete.mdx'), 'Old reference\n');
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  it('rejects obsolete and missing references without changing files in check mode', () => {
    expect(
      syncUiReferenceFiles({ directory, outputs, isCheckMode: true }),
    ).toEqual([
      'Obsolete UI reference: input/obsolete.mdx',
      'Stale UI reference: input/current.mdx',
    ]);
    expect(readFileSync(join(directory, 'input/obsolete.mdx'), 'utf8')).toBe(
      'Old reference\n',
    );
    expect(existsSync(join(directory, 'input/current.mdx'))).toBe(false);
  });

  it('removes obsolete snippets, writes current outputs, and passes a subsequent check', () => {
    writeFileSync(join(directory, 'metadata.json'), '{}');

    expect(
      syncUiReferenceFiles({ directory, outputs, isCheckMode: false }),
    ).toEqual([]);
    expect(existsSync(join(directory, 'input/obsolete.mdx'))).toBe(false);
    expect(readFileSync(join(directory, 'input/current.mdx'), 'utf8')).toBe(
      outputs[0].content,
    );
    expect(existsSync(join(directory, 'metadata.json'))).toBe(true);
    expect(
      syncUiReferenceFiles({ directory, outputs, isCheckMode: true }),
    ).toEqual([]);
  });

  it('reports changed content without overwriting it in check mode', () => {
    rmSync(join(directory, 'input/obsolete.mdx'));
    writeFileSync(join(directory, 'input/current.mdx'), 'Outdated reference\n');

    expect(
      syncUiReferenceFiles({ directory, outputs, isCheckMode: true }),
    ).toEqual(['Stale UI reference: input/current.mdx']);
    expect(readFileSync(join(directory, 'input/current.mdx'), 'utf8')).toBe(
      'Outdated reference\n',
    );
  });
});
