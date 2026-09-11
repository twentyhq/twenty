import { Test, type TestingModule } from '@nestjs/testing';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { DisabledDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/disabled.driver';
import { LocalDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local.driver';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { LogicFunctionResourceService } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.service';
import { SdkClientArchiveService } from 'src/engine/core-modules/sdk-client/sdk-client-archive.service';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { LogicFunctionException } from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('LogicFunctionDriverFactory', () => {
  let factory: LogicFunctionDriverFactory;
  let twentyConfigService: TwentyConfigService;

  const mockTwentyConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogicFunctionDriverFactory,
        {
          provide: TwentyConfigService,
          useValue: mockTwentyConfigService,
        },
        {
          provide: ConfigGroupHashService,
          useValue: { computeHash: jest.fn().mockReturnValue('') },
        },
        {
          provide: LogicFunctionResourceService,
          useValue: {},
        },
        {
          provide: SdkClientArchiveService,
          useValue: {},
        },
        {
          provide: CacheLockService,
          useValue: {},
        },
        {
          provide: WorkspaceCacheService,
          useValue: {},
        },
      ],
    }).compile();

    factory = module.get(LogicFunctionDriverFactory);
    twentyConfigService = module.get(TwentyConfigService);

    jest.clearAllMocks();
  });

  describe('createDriver', () => {
    it('refuses LOCAL when NODE_ENV is production', async () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'LOGIC_FUNCTION_TYPE') {
            return LogicFunctionDriverType.LOCAL;
          }

          if (key === 'NODE_ENV') {
            return NodeEnvironment.PRODUCTION;
          }

          return undefined;
        });

      const driver = factory['createDriver']() as DisabledDriver;

      expect(driver).toBeInstanceOf(DisabledDriver);
      await expect(driver.execute()).rejects.toBeInstanceOf(
        LogicFunctionException,
      );
      await expect(driver.execute()).rejects.toThrow(
        'LOCAL logic function driver is not allowed in production',
      );
    });

    it('creates LocalDriver when NODE_ENV is development', () => {
      jest
        .spyOn(twentyConfigService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'LOGIC_FUNCTION_TYPE') {
            return LogicFunctionDriverType.LOCAL;
          }

          if (key === 'NODE_ENV') {
            return NodeEnvironment.DEVELOPMENT;
          }

          return undefined;
        });

      const driver = factory['createDriver']();

      expect(driver).toBeInstanceOf(LocalDriver);
    });
  });
});
