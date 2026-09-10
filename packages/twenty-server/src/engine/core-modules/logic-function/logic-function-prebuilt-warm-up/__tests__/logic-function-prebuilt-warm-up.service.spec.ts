import { Test, type TestingModule } from '@nestjs/testing';

import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { LogicFunctionPrebuiltWarmUpService } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/logic-function-prebuilt-warm-up.service';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const APPLICATION_ID = '20202020-0000-0000-0000-000000000002';
const OTHER_APPLICATION_ID = '20202020-0000-0000-0000-000000000003';

const flatApplication = {
  id: APPLICATION_ID,
  universalIdentifier: 'test-app',
};

const ALL_UNIVERSAL_IDENTIFIERS = [
  'universal-ready-1',
  'universal-ready-2',
  'universal-live',
  'universal-not-built',
  'universal-other-app',
  'universal-installed',
  'universal-outdated',
  'universal-failing',
  'universal-unknown',
];

const buildFlatLogicFunction = (overrides: {
  id: string;
  applicationId?: string;
  checksum?: string | null;
  executionMode?: LogicFunctionExecutionMode;
  isBuildUpToDate?: boolean;
}) => ({
  universalIdentifier: `universal-${overrides.id}`,
  applicationId: APPLICATION_ID,
  checksum: 'checksum-new',
  executionMode: LogicFunctionExecutionMode.PREBUILT,
  isBuildUpToDate: true,
  ...overrides,
});

describe('LogicFunctionPrebuiltWarmUpService', () => {
  let service: LogicFunctionPrebuiltWarmUpService;

  const workspaceCacheService = { getOrRecompute: jest.fn() };
  const driver = {
    getInstalledBundleChecksum: jest.fn(),
    installPrebuiltBundle: jest.fn(),
  };
  const logicFunctionDriverFactory = { getCurrentDriver: () => driver };

  const setFlatLogicFunctions = (
    flatLogicFunctions: ReturnType<typeof buildFlatLogicFunction>[],
    options: { withApplication?: boolean } = {},
  ) => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatApplicationMaps: {
        byId:
          options.withApplication === false
            ? {}
            : { [APPLICATION_ID]: flatApplication },
      },
      flatLogicFunctionMaps: {
        byUniversalIdentifier: Object.fromEntries(
          flatLogicFunctions.map((flatLogicFunction) => [
            flatLogicFunction.universalIdentifier,
            flatLogicFunction,
          ]),
        ),
        universalIdentifiersByApplicationId: {
          [APPLICATION_ID]: flatLogicFunctions
            .filter(
              (flatLogicFunction) =>
                flatLogicFunction.applicationId === APPLICATION_ID,
            )
            .map((flatLogicFunction) => flatLogicFunction.universalIdentifier),
        },
      },
    });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    driver.getInstalledBundleChecksum.mockResolvedValue(null);
    driver.installPrebuiltBundle.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogicFunctionPrebuiltWarmUpService,
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        {
          provide: LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN,
          useValue: logicFunctionDriverFactory,
        },
      ],
    }).compile();

    service = module.get(LogicFunctionPrebuiltWarmUpService);
  });

  it('installs the prebuilt bundle of the listed ready functions of the application', async () => {
    setFlatLogicFunctions([
      buildFlatLogicFunction({ id: 'ready-1' }),
      buildFlatLogicFunction({ id: 'ready-2' }),
      buildFlatLogicFunction({
        id: 'live',
        executionMode: LogicFunctionExecutionMode.LIVE,
      }),
      buildFlatLogicFunction({ id: 'not-built', isBuildUpToDate: false }),
      buildFlatLogicFunction({
        id: 'other-app',
        applicationId: OTHER_APPLICATION_ID,
      }),
    ]);

    await service.warmUpApplicationLogicFunctions({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
      logicFunctionUniversalIdentifiers: ALL_UNIVERSAL_IDENTIFIERS,
    });

    expect(driver.installPrebuiltBundle).toHaveBeenCalledTimes(2);
    expect(
      driver.installPrebuiltBundle.mock.calls.map(
        ([params]) => params.flatLogicFunction.id,
      ),
    ).toEqual(['ready-1', 'ready-2']);
    expect(driver.installPrebuiltBundle).toHaveBeenCalledWith(
      expect.objectContaining({
        flatApplication,
        applicationUniversalIdentifier: 'test-app',
      }),
    );
  });

  it('skips functions whose installed bundle already matches the checksum', async () => {
    setFlatLogicFunctions([
      buildFlatLogicFunction({ id: 'installed', checksum: 'checksum-same' }),
      buildFlatLogicFunction({ id: 'outdated', checksum: 'checksum-new' }),
    ]);
    driver.getInstalledBundleChecksum.mockImplementation(
      async (flatLogicFunction: { id: string }) =>
        flatLogicFunction.id === 'installed' ? 'checksum-same' : 'old',
    );

    await service.warmUpApplicationLogicFunctions({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
      logicFunctionUniversalIdentifiers: ALL_UNIVERSAL_IDENTIFIERS,
    });

    expect(driver.installPrebuiltBundle).toHaveBeenCalledTimes(1);
    expect(driver.installPrebuiltBundle).toHaveBeenCalledWith(
      expect.objectContaining({
        flatLogicFunction: expect.objectContaining({ id: 'outdated' }),
      }),
    );
  });

  it('only touches the listed functions', async () => {
    setFlatLogicFunctions([
      buildFlatLogicFunction({ id: 'ready-1' }),
      buildFlatLogicFunction({ id: 'ready-2' }),
    ]);

    await service.warmUpApplicationLogicFunctions({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
      logicFunctionUniversalIdentifiers: ['universal-ready-2'],
    });

    expect(driver.installPrebuiltBundle).toHaveBeenCalledTimes(1);
    expect(driver.installPrebuiltBundle).toHaveBeenCalledWith(
      expect.objectContaining({
        flatLogicFunction: expect.objectContaining({ id: 'ready-2' }),
      }),
    );
  });

  it('builds the functions in chunks of ten', async () => {
    const flatLogicFunctions = Array.from({ length: 15 }, (_, index) =>
      buildFlatLogicFunction({ id: `function-${index}` }),
    );

    setFlatLogicFunctions(flatLogicFunctions);

    let inFlight = 0;
    let maxInFlight = 0;

    driver.installPrebuiltBundle.mockImplementation(async () => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await Promise.resolve();
      inFlight -= 1;
    });

    await service.warmUpApplicationLogicFunctions({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
      logicFunctionUniversalIdentifiers: flatLogicFunctions.map(
        (flatLogicFunction) => flatLogicFunction.universalIdentifier,
      ),
    });

    expect(driver.installPrebuiltBundle).toHaveBeenCalledTimes(15);
    expect(maxInFlight).toBe(10);
  });

  it('does nothing when the application is no longer installed', async () => {
    setFlatLogicFunctions([buildFlatLogicFunction({ id: 'ready-1' })], {
      withApplication: false,
    });

    await service.warmUpApplicationLogicFunctions({
      workspaceId: WORKSPACE_ID,
      applicationId: APPLICATION_ID,
      logicFunctionUniversalIdentifiers: ALL_UNIVERSAL_IDENTIFIERS,
    });

    expect(driver.installPrebuiltBundle).not.toHaveBeenCalled();
  });

  it('keeps installing the other functions and throws when one install fails', async () => {
    setFlatLogicFunctions([
      buildFlatLogicFunction({ id: 'ready-1' }),
      buildFlatLogicFunction({ id: 'failing' }),
      buildFlatLogicFunction({ id: 'ready-2' }),
    ]);
    driver.installPrebuiltBundle.mockImplementation(
      async ({ flatLogicFunction }: { flatLogicFunction: { id: string } }) => {
        if (flatLogicFunction.id === 'failing') {
          throw new Error('lambda unavailable');
        }
      },
    );

    await expect(
      service.warmUpApplicationLogicFunctions({
        workspaceId: WORKSPACE_ID,
        applicationId: APPLICATION_ID,
        logicFunctionUniversalIdentifiers: ALL_UNIVERSAL_IDENTIFIERS,
      }),
    ).rejects.toThrow(
      /Failed to warm up 1 of 3 prebuilt logic functions .*: failing: Failed to install the prebuilt bundle for function 'failing'/,
    );

    expect(driver.installPrebuiltBundle).toHaveBeenCalledTimes(3);
  });
});
