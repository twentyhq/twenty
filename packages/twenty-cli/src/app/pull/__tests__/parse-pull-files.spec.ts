import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { parsePullFiles } from '@/app/pull/parse-pull-files';

const getSourceChecksum = (content: string | Buffer) =>
  createHash('md5').update(content).digest('hex');

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
      'declared frontend component',
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

  const helper = {
    folder: 'source',
    path: 'src/helper.ts',
    content: 'export const greeting = "hello";',
  };
  const withInventory = (files = [sourceFile, helper]) => [
    {
      ...component,
      sourceFiles: files.map((file) => ({
        filePath: file.path,
        checksum: getSourceChecksum(file.content),
      })),
    },
  ];
  it('accepts inventoried helpers and binary files only when their checksums match', () => {
    const binary = {
      folder: 'source',
      path: 'src/font.woff2',
      content: Buffer.from([0, 255, 128]).toString('base64'),
      encoding: 'base64',
    };
    const frontComponents = withInventory();
    frontComponents[0].sourceFiles.push({
      filePath: binary.path,
      checksum: getSourceChecksum(Buffer.from(binary.content, 'base64')),
    });
    expect(
      parsePullFiles({ value: [sourceFile, helper, binary], frontComponents }),
    ).toEqual([sourceFile, helper, binary]);
  });
  it.each(
    [
      [],
      [sourceFile],
      [sourceFile, { ...helper, content: 'tampered' }],
      [sourceFile, { ...helper, folder: 'attachment' }],
    ].map((files) => ({ files })),
  )('rejects incomplete or corrupt inventory contents (%#)', ({ files }) => {
    expect(() =>
      parsePullFiles({ value: files, frontComponents: withInventory() }),
    ).toThrow();
  });
  it.each([
    '../secret.ts',
    '/secret.ts',
    '.env',
    'node_modules/module.ts',
    '.twenty/secret.ts',
    'package.json',
    'C:/secret.ts',
    'src/../secret.ts',
  ])('rejects inventoried unsafe path %s', (path) => {
    const files = [sourceFile, { ...helper, path }];
    expect(() =>
      parsePullFiles({ value: files, frontComponents: withInventory(files) }),
    ).toThrow('invalid application source inventory');
  });
  it('accepts explicitly inventoried generated helpers under dist', () => {
    const files = [sourceFile, { ...helper, path: 'generated/dist/helper.js' }];
    expect(
      parsePullFiles({ value: files, frontComponents: withInventory(files) }),
    ).toEqual(files);
  });
  it('accepts a public asset shared with a source inventory without duplicating it', () => {
    const frontComponents = withInventory([sourceFile]);
    frontComponents[0].sourceFiles.push({
      filePath: asset.path,
      checksum: getSourceChecksum(Buffer.from(asset.content, 'base64')),
    });
    expect(
      parsePullFiles({ value: [sourceFile, asset], frontComponents }),
    ).toEqual([sourceFile, asset]);
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
