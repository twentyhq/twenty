import { FileFolder } from 'twenty-shared/types';

import { findLogicFunctionFilesWithoutFileRow } from 'src/database/commands/upgrade-version-command/2-43/utils/find-logic-function-files-without-file-row.util';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const APPLICATION_ID = 'application-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-universal-identifier';

const buildFlatApplicationMaps = (
  applications: Partial<FlatApplication>[],
): FlatApplicationCacheMaps =>
  ({
    byId: Object.fromEntries(
      applications.map((application) => [application.id, application]),
    ),
    idByUniversalIdentifier: Object.fromEntries(
      applications.map((application) => [
        application.universalIdentifier,
        application.id,
      ]),
    ),
  }) as FlatApplicationCacheMaps;

const FLAT_APPLICATION_MAPS = buildFlatApplicationMaps([
  {
    id: APPLICATION_ID,
    universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    deletedAt: null,
  },
]);

const buildFlatLogicFunction = (
  logicFunctionId: string,
  overrides: Partial<FlatLogicFunction> = {},
): FlatLogicFunction =>
  ({
    id: logicFunctionId,
    applicationId: APPLICATION_ID,
    sourceHandlerPath: `${logicFunctionId}/src/index.ts`,
    builtHandlerPath: `${logicFunctionId}/src/index.mjs`,
    ...overrides,
  }) as FlatLogicFunction;

describe('findLogicFunctionFilesWithoutFileRow', () => {
  it('returns the source and built files that have no file row', () => {
    const result = findLogicFunctionFilesWithoutFileRow({
      flatLogicFunctions: [buildFlatLogicFunction('logic-function'), undefined],
      flatApplicationMaps: FLAT_APPLICATION_MAPS,
      existingFileRows: [],
    });

    expect(result).toEqual([
      {
        applicationId: APPLICATION_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        fileFolder: FileFolder.Source,
        resourcePath: 'logic-function/src/index.ts',
        path: 'source/logic-function/src/index.ts',
      },
      {
        applicationId: APPLICATION_ID,
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: 'logic-function/src/index.mjs',
        path: 'built-logic-function/logic-function/src/index.mjs',
      },
    ]);
  });

  it('skips files whose row exists for the same application', () => {
    const result = findLogicFunctionFilesWithoutFileRow({
      flatLogicFunctions: [buildFlatLogicFunction('logic-function')],
      flatApplicationMaps: FLAT_APPLICATION_MAPS,
      existingFileRows: [
        {
          applicationId: APPLICATION_ID,
          path: 'source/logic-function/src/index.ts',
        },
        {
          applicationId: 'other-application-id',
          path: 'built-logic-function/logic-function/src/index.mjs',
        },
      ],
    });

    expect(result.map(({ path }) => path)).toEqual([
      'built-logic-function/logic-function/src/index.mjs',
    ]);
  });

  it('skips logic functions whose application is missing or deleted', () => {
    const result = findLogicFunctionFilesWithoutFileRow({
      flatLogicFunctions: [
        buildFlatLogicFunction('unknown-application-logic-function', {
          applicationId: 'unknown-application-id',
        }),
        buildFlatLogicFunction('deleted-application-logic-function', {
          applicationId: 'deleted-application-id',
        }),
      ],
      flatApplicationMaps: buildFlatApplicationMaps([
        {
          id: 'deleted-application-id',
          universalIdentifier: 'deleted-application',
          deletedAt: new Date('2026-09-01T00:00:00.000Z'),
        },
      ]),
      existingFileRows: [],
    });

    expect(result).toEqual([]);
  });

  it('returns a file shared by several logic functions once', () => {
    const sharedHandlerPaths = {
      sourceHandlerPath: 'shared/src/index.ts',
      builtHandlerPath: 'shared/src/index.mjs',
    };

    const result = findLogicFunctionFilesWithoutFileRow({
      flatLogicFunctions: [
        buildFlatLogicFunction('first-logic-function', sharedHandlerPaths),
        buildFlatLogicFunction('second-logic-function', sharedHandlerPaths),
      ],
      flatApplicationMaps: FLAT_APPLICATION_MAPS,
      existingFileRows: [],
    });

    expect(result.map(({ path }) => path)).toEqual([
      'source/shared/src/index.ts',
      'built-logic-function/shared/src/index.mjs',
    ]);
  });
});
