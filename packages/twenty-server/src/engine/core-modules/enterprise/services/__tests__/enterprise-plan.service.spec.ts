/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { ENTERPRISE_VALIDITY_TOKEN_RELOAD_INTERVAL_MS } from 'src/engine/core-modules/enterprise/constants/enterprise-validity-token-reload-interval.constant';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

describe('EnterprisePlanService', () => {
  let service: EnterprisePlanService;

  const appTokenRepository = { findOne: jest.fn() };
  const twentyConfigService = { get: jest.fn() };

  // The reload is deliberately not awaited by its caller, so the assertions
  // that follow one have to let the microtask queue drain first.
  const flushPendingReload = () => Promise.resolve();

  const START_TIME = 1_700_000_000_000;
  let currentTime = START_TIME;

  const advanceClockTo = (millisecondsFromStart: number) => {
    currentTime = START_TIME + millisecondsFromStart;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    currentTime = START_TIME;
    jest.spyOn(Date, 'now').mockImplementation(() => currentTime);
    appTokenRepository.findOne.mockResolvedValue(null);
    twentyConfigService.get.mockReturnValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterprisePlanService,
        { provide: TwentyConfigService, useValue: twentyConfigService },
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: appTokenRepository,
        },
        { provide: getRepositoryToken(UserWorkspaceEntity), useValue: {} },
        { provide: getRepositoryToken(UserEntity), useValue: {} },
        { provide: getRepositoryToken(WorkspaceEntity), useValue: {} },
      ],
    }).compile();

    service = module.get<EnterprisePlanService>(EnterprisePlanService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('hasValidEnterpriseValidityToken', () => {
    it('reads the stored token on the first check', async () => {
      service.hasValidEnterpriseValidityToken();
      await flushPendingReload();

      expect(appTokenRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('reads the stored token once per reload interval however often it is checked', async () => {
      service.hasValidEnterpriseValidityToken();
      await flushPendingReload();
      service.hasValidEnterpriseValidityToken();
      service.hasValidEnterpriseValidityToken();

      expect(appTokenRepository.findOne).toHaveBeenCalledTimes(1);
    });

    // The worker renews the token in the database, so a server process that
    // never re-read it would serve its boot-time copy until that copy expired.
    it('reads the stored token again once the reload interval has elapsed', async () => {
      service.hasValidEnterpriseValidityToken();
      await flushPendingReload();

      advanceClockTo(ENTERPRISE_VALIDITY_TOKEN_RELOAD_INTERVAL_MS);
      service.hasValidEnterpriseValidityToken();
      await flushPendingReload();

      expect(appTokenRepository.findOne).toHaveBeenCalledTimes(2);
    });
  });
});
