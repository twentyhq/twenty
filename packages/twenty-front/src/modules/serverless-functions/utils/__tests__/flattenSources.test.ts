// IA Generated

import { flattenSources } from '@/serverless-functions/utils/flattenSources';
import { type Sources } from 'twenty-shared/types';

describe('flattenSources', () => {
  it('flattens nested sources with root files', () => {
    const input: Sources = {
      '.env': 'KEY=VALUE',
      src: {
        'index.ts': 'export const a = 1',
        lib: {
          'util.ts': 'export const util = () => {}',
        },
      },
      docs: {
        'README.md': '# Hello',
      },
    };

    const result = flattenSources(input);

    expect(result).toEqual([
      { path: '.env', content: 'KEY=VALUE' },
      { path: 'docs/README.md', content: '# Hello' },
      { path: 'src/index.ts', content: 'export const a = 1' },
      { path: 'src/lib/util.ts', content: 'export const util = () => {}' },
    ]);
  });

  it('handles deep nesting and preserves file contents', () => {
    const input: Sources = {
      a: { b: { c: { d: { 'file.ts': 'content' } } } },
    };

    expect(flattenSources(input)).toEqual([
      { path: 'a/b/c/d/file.ts', content: 'content' },
    ]);
  });

  it('ignores empty folders and non-string leaves', () => {
    const input: Sources = {
      empty: {},
      weird: {
        oops: 42,
      } as unknown as Sources,
      file: 'ok',
    };

    const res = flattenSources(input);
    expect(res).toEqual([{ path: 'file', content: 'ok' }]);
  });

  it('accepts a custom basePath prefix', () => {
    const input: Sources = { src: { 'index.ts': 'x' } };
    const res = flattenSources(input, 'pkg');
    expect(res).toEqual([{ path: 'pkg/src/index.ts', content: 'x' }]);
  });
});
