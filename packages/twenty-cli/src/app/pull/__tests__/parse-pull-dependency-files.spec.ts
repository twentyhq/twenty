import { describe, expect, it } from 'vitest';

import { parsePullDependencyFiles } from '@/app/pull/parse-pull-dependency-files';

const packageFile = {
  folder: 'dependencies',
  path: 'package.json',
  content: '{"name":"app"}\n',
};

describe('parsePullDependencyFiles', () => {
  it('retains the exact dependency contents', () => {
    const files = [
      packageFile,
      { folder: 'dependencies', path: 'yarn.lock', content: '' },
    ];
    expect(parsePullDependencyFiles(files)).toEqual(files);
  });

  it.each([
    '../package.json',
    '/package.json',
    'nested/package.json',
    '.npmrc',
    'node_modules/package.json',
    'yarn.lock/../package.json',
    '..\\package.json',
  ])('refuses the dependency path %s', (path) => {
    expect(() => parsePullDependencyFiles([{ ...packageFile, path }])).toThrow(
      'only pull package.json and yarn.lock',
    );
  });

  it.each([
    null,
    {},
    [{ ...packageFile, content: null }],
    [packageFile, packageFile],
  ])('refuses malformed or duplicate files (%#)', (files) => {
    expect(() => parsePullDependencyFiles(files)).toThrow();
  });

  it.each(['invalid-json', 'null', '[]', '42', '{}, {}'])(
    'refuses invalid package.json contents %s',
    (content) => {
      expect(() =>
        parsePullDependencyFiles([{ ...packageFile, content }]),
      ).toThrow('JSON object');
    },
  );
});
