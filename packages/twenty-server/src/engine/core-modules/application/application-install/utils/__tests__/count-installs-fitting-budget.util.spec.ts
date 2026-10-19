import { countInstallsFittingBudget } from 'src/engine/core-modules/application/application-install/utils/count-installs-fitting-budget.util';

const buildManifest = (logicFunctionCount: number) => ({
  application: {},
  logicFunctions: Array.from({ length: logicFunctionCount }, (_, index) => ({
    universalIdentifier: `function-${index}`,
    sourceHandlerPath: `src/function-${index}.ts`,
    builtHandlerPath: `dist/function-${index}.mjs`,
    builtHandlerChecksum: `checksum-${index}`,
    handlerName: 'main',
  })),
});

describe('countInstallsFittingBudget', () => {
  it('fits as many whole installs as the available budget allows', () => {
    expect(
      countInstallsFittingBudget({
        manifest: buildManifest(10),
        isVersionUpgrade: true,
        workspaceCount: 100,
        availableBudget: { availableFunctionCount: 35, maxFunctionCount: 60 },
      }),
    ).toEqual({ installCount: 3, functionCount: 30 });
  });

  it('never fits more installs than there are workspaces', () => {
    expect(
      countInstallsFittingBudget({
        manifest: buildManifest(10),
        isVersionUpgrade: true,
        workspaceCount: 2,
        availableBudget: { availableFunctionCount: 60, maxFunctionCount: 60 },
      }),
    ).toEqual({ installCount: 2, functionCount: 20 });
  });

  it('lets an install bigger than the whole budget fit once the budget is full', () => {
    expect(
      countInstallsFittingBudget({
        manifest: buildManifest(80),
        isVersionUpgrade: true,
        workspaceCount: 5,
        availableBudget: { availableFunctionCount: 60, maxFunctionCount: 60 },
      }),
    ).toEqual({ installCount: 1, functionCount: 60 });
  });

  it('fits every install of an app without functions', () => {
    expect(
      countInstallsFittingBudget({
        manifest: buildManifest(0),
        isVersionUpgrade: true,
        workspaceCount: 5,
        availableBudget: { availableFunctionCount: 0, maxFunctionCount: 60 },
      }),
    ).toEqual({ installCount: 5, functionCount: 0 });
  });

  it('fits every install when the budget is unlimited', () => {
    expect(
      countInstallsFittingBudget({
        manifest: buildManifest(10),
        isVersionUpgrade: true,
        workspaceCount: 5,
        availableBudget: {
          availableFunctionCount: Number.POSITIVE_INFINITY,
          maxFunctionCount: Number.POSITIVE_INFINITY,
        },
      }),
    ).toEqual({ installCount: 5, functionCount: 50 });
  });
});
