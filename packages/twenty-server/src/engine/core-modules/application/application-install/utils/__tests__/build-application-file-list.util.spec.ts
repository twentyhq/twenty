import { type Manifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

import { buildApplicationFileList } from 'src/engine/core-modules/application/application-install/utils/build-application-file-list.util';

describe('buildApplicationFileList', () => {
  it('includes source and built files for logic functions and front components', () => {
    const manifest = {
      application: {},
      logicFunctions: [
        {
          sourceHandlerPath: 'src/send-email.function.ts',
          builtHandlerPath: 'src/send-email.function.mjs',
        },
      ],
      frontComponents: [
        {
          sourceComponentPath: 'src/inbox.front-component.tsx',
          builtComponentPath: 'src/inbox.front-component.mjs',
        },
      ],
      publicAssets: [{ filePath: 'assets/logo.svg' }],
    } as Manifest;

    expect(buildApplicationFileList(manifest)).toEqual([
      {
        relativePath: 'package.json',
        fileFolder: FileFolder.Dependencies,
        isRequired: true,
      },
      {
        relativePath: 'manifest.json',
        fileFolder: FileFolder.Source,
        isRequired: true,
      },
      {
        relativePath: 'src/send-email.function.ts',
        fileFolder: FileFolder.Source,
        isRequired: false,
      },
      {
        relativePath: 'src/send-email.function.mjs',
        fileFolder: FileFolder.BuiltLogicFunction,
        isRequired: true,
      },
      {
        relativePath: 'src/inbox.front-component.tsx',
        fileFolder: FileFolder.Source,
        isRequired: false,
      },
      {
        relativePath: 'src/inbox.front-component.mjs',
        fileFolder: FileFolder.BuiltFrontComponent,
        isRequired: true,
      },
      {
        relativePath: 'assets/logo.svg',
        fileFolder: FileFolder.PublicAsset,
        isRequired: true,
      },
    ]);
  });

  it('includes the shared dependencies source and bundle when the application declares one', () => {
    const manifest = {
      application: {
        frontComponentSharedDependencies: {
          dependencies: ['react'],
          sourcePath: 'src/front-component-shared-dependencies.ts',
          builtPath: 'src/front-component-shared-dependencies.mjs',
          builtChecksum: 'checksum',
        },
      },
    } as Manifest;

    expect(buildApplicationFileList(manifest)).toEqual(
      expect.arrayContaining([
        {
          relativePath: 'src/front-component-shared-dependencies.ts',
          fileFolder: FileFolder.Source,
          isRequired: false,
        },
        {
          relativePath: 'src/front-component-shared-dependencies.mjs',
          fileFolder: FileFolder.BuiltFrontComponent,
          isRequired: true,
        },
      ]),
    );
  });
});
