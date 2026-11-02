import { type FrontComponentManifest } from 'twenty-shared/application';
import { describe, expect, it } from 'vitest';

import { parsePullFiles } from '@/app/pull/parse-pull-files';

const packageFile = {
  folder: 'dependencies',
  path: 'package.json',
  content: '{"name":"app"}\n',
};

describe('parsePullFiles', () => {
  it('retains the exact dependency contents', () => {
    const files = [
      packageFile,
      { folder: 'dependencies', path: 'yarn.lock', content: '' },
    ];
    expect(parsePullFiles(files)).toEqual(files);
  });

  const component = {
    universalIdentifier: 'fefefefe-fefe-4efe-8efe-fefefefefefe',
    sourceComponentPath: 'src/components/hello.tsx',
  } as FrontComponentManifest;
  const sourceFile = {
    folder: 'source',
    path: component.sourceComponentPath,
    content: 'original TSX',
  };

  it('accepts only source files declared by exported frontend components', () => {
    expect(parsePullFiles([sourceFile], [component])).toEqual([sourceFile]);
    expect(() => parsePullFiles([sourceFile])).toThrow(
      'declared front component',
    );
    expect(() =>
      parsePullFiles([{ ...sourceFile, folder: 'attachment' }], [component]),
    ).toThrow();
  });

  it.each([
    '../escape.tsx',
    '/escape.tsx',
    'node_modules/component.tsx',
    'src/../../escape.tsx',
    'src/./component.tsx',
    'src/extra.d.ts',
    '.twenty/component.tsx',
    'src\\component.tsx',
  ])('refuses the declared source path %s', (path) => {
    expect(() =>
      parsePullFiles(
        [{ ...sourceFile, path }],
        [{ ...component, sourceComponentPath: path }],
      ),
    ).toThrow();
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
    expect(() => parsePullFiles([{ ...packageFile, path }])).toThrow(
      'only pull dependency files',
    );
  });

  it.each([
    null,
    {},
    [{ ...packageFile, content: null }],
    [packageFile, packageFile],
  ])('refuses malformed or duplicate files (%#)', (files) => {
    expect(() => parsePullFiles(files)).toThrow();
  });

  it.each(['invalid-json', 'null', '[]', '42', '{}, {}'])(
    'refuses invalid package.json contents %s',
    (content) => {
      expect(() => parsePullFiles([{ ...packageFile, content }])).toThrow(
        'JSON object',
      );
    },
  );
});
