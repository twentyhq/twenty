import { describe, expect, it } from 'vitest';

import { parsePullFiles } from '@/app/pull/parse-pull-files';

const packageFile = {
  folder: 'dependencies',
  path: 'package.json',
  content: '{"name":"app"}\n',
};

describe('parsePullFiles', () => {
  const asset = {
    folder: 'public-asset',
    path: 'public/font.woff2',
    content: 'AP+A',
  };
  it('accepts binary public assets by category without a manifest entry', () => {
    expect(parsePullFiles({ value: [asset] })).toEqual([asset]);
  });
  it.each(['attachment', 'source', 'dependencies'])(
    'rejects an asset in the %s category',
    (folder) => {
      expect(() => parsePullFiles({ value: [{ ...asset, folder }] })).toThrow();
    },
  );
  it.each([
    'public/../secret',
    'public/./font',
    'public//font',
    'public/\\font',
    'public/font\0.woff2',
    '/public/font',
    'private/font',
    'public/../application.config.ts',
    'public/../../outside',
  ])('rejects the asset path %s', (path) => {
    expect(() =>
      parsePullFiles({
        value: [{ ...asset, path }],
      }),
    ).toThrow('safe path under public/');
  });
  it('rejects corrupt base64 before writing', () => {
    expect(() =>
      parsePullFiles({
        value: [{ ...asset, content: 'not base64!' }],
      }),
    ).toThrow('base64');
  });

  it('retains the exact dependency contents', () => {
    const files = [
      packageFile,
      { folder: 'dependencies', path: 'yarn.lock', content: '' },
    ];
    expect(parsePullFiles({ value: files })).toEqual(files);
  });

  const component = {
    universalIdentifier: 'fefefefe-fefe-4efe-8efe-fefefefefefe',
    sourceComponentPath: 'src/components/hello.tsx',
  };
  const sourceFile = {
    folder: 'source',
    path: component.sourceComponentPath,
    content: 'original TSX',
  };

  it('accepts only source files declared by exported frontend components', () => {
    expect(
      parsePullFiles({ value: [sourceFile], frontComponents: [component] }),
    ).toEqual([sourceFile]);
    expect(() => parsePullFiles({ value: [sourceFile] })).toThrow(
      'declared front component',
    );
    expect(() =>
      parsePullFiles({
        value: [{ ...sourceFile, folder: 'attachment' }],
        frontComponents: [component],
      }),
    ).toThrow();
  });

  it.each([
    '../escape.tsx',
    '/escape.tsx',
    'C:/escape.tsx',
    'c:escape.tsx',
    'node_modules/component.tsx',
    'src/../../escape.tsx',
    'src/./component.tsx',
    'src/extra.d.ts',
    '.twenty/component.tsx',
    'src\\component.tsx',
  ])('refuses the declared source path %s', (path) => {
    expect(() =>
      parsePullFiles({
        value: [{ ...sourceFile, path }],
        frontComponents: [{ ...component, sourceComponentPath: path }],
      }),
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
    expect(() => parsePullFiles({ value: [{ ...packageFile, path }] })).toThrow(
      'only pull dependency files',
    );
  });

  it.each([
    null,
    {},
    [{ ...packageFile, content: null }],
    [packageFile, packageFile],
  ])('refuses malformed or duplicate files (%#)', (files) => {
    expect(() => parsePullFiles({ value: files })).toThrow();
  });

  it.each(['invalid-json', 'null', '[]', '42', '{}, {}'])(
    'refuses invalid package.json contents %s',
    (content) => {
      expect(() =>
        parsePullFiles({ value: [{ ...packageFile, content }] }),
      ).toThrow('JSON object');
    },
  );
});
