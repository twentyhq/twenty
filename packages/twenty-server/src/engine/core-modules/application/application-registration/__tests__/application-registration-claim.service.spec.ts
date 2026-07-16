import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import axios from 'axios';
import { type Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationRegistrationClaimService } from 'src/engine/core-modules/application/application-registration/application-registration-claim.service';
import { ApplicationRegistrationLifecycleEmailService } from 'src/engine/core-modules/application/application-registration/application-registration-lifecycle-email.service';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const WORKSPACE_ID = 'workspace-1';
const REGISTRATION_ID = 'registration-1';

const buildRegistration = (
  overrides: Partial<ApplicationRegistrationEntity> = {},
): ApplicationRegistrationEntity =>
  ({
    id: REGISTRATION_ID,
    ownerWorkspaceId: null,
    sourceType: ApplicationRegistrationSourceType.NPM,
    sourcePackage: 'my-twenty-app',
    ...overrides,
  }) as ApplicationRegistrationEntity;

describe('ApplicationRegistrationClaimService', () => {
  let service: ApplicationRegistrationClaimService;
  let appTokenRepository: jest.Mocked<Repository<AppTokenEntity>>;
  let applicationRegistrationService: jest.Mocked<ApplicationRegistrationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationClaimService,
        {
          provide: getRepositoryToken(AppTokenEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            upsert: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ApplicationRegistrationLifecycleEmailService,
          useValue: {
            sendApplicationClaimedEmails: jest.fn(),
          },
        },
        {
          provide: ApplicationRegistrationService,
          useValue: {
            findOneByIdGlobal: jest.fn(),
            claimOwnership: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('https://registry.npmjs.org'),
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationRegistrationClaimService);
    appTokenRepository = module.get(getRepositoryToken(AppTokenEntity));
    applicationRegistrationService = module.get(ApplicationRegistrationService);
    mockedAxios.isAxiosError.mockReturnValue(false);
  });

  afterEach(() => jest.clearAllMocks());

  const expectException = async (
    promise: Promise<unknown>,
    code: ApplicationRegistrationExceptionCode,
  ) => {
    await expect(promise).rejects.toThrow(ApplicationRegistrationException);
    await promise.catch((error) => expect(error.code).toBe(code));
  };

  describe('startClaim', () => {
    it('rejects an already-owned registration', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration({ ownerWorkspaceId: 'other-workspace' }),
      );

      await expectException(
        service.startClaim({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
          userId: null,
        }),
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_ALREADY_OWNED,
      );
    });

    it('rejects a non-npm registration', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration({
          sourceType: ApplicationRegistrationSourceType.LOCAL,
          sourcePackage: null,
        }),
      );

      await expectException(
        service.startClaim({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
          userId: null,
        }),
        ApplicationRegistrationExceptionCode.CLAIM_NOT_SUPPORTED,
      );
    });

    it('upserts a claim token and returns the challenge', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );

      const challenge = await service.startClaim({
        applicationRegistrationId: REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
        userId: 'user-1',
      });

      expect(appTokenRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
          userId: 'user-1',
          type: AppTokenType.ApplicationRegistrationClaimToken,
          value: challenge.token,
        }),
        expect.objectContaining({
          conflictPaths: ['applicationRegistrationId', 'workspaceId'],
        }),
      );
      expect(challenge.sourcePackage).toBe('my-twenty-app');
      expect(challenge.token).toHaveLength(32);
      expect(challenge.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('findPendingClaimsForWorkspace', () => {
    it('returns the challenges of unexpired claims', async () => {
      const expiresAt = new Date(Date.now() + 60_000);

      appTokenRepository.find.mockResolvedValue([
        {
          value: 'valid-token',
          expiresAt,
          applicationRegistration: buildRegistration({
            name: 'My app',
            description: 'A description',
          }),
        } as unknown as AppTokenEntity,
      ]);

      const pending = await service.findPendingClaimsForWorkspace(WORKSPACE_ID);

      expect(pending).toEqual([
        {
          applicationRegistrationId: REGISTRATION_ID,
          name: 'My app',
          description: 'A description',
          sourcePackage: 'my-twenty-app',
          token: 'valid-token',
          expiresAt,
        },
      ]);
    });

    it('excludes claims whose registration got owned in the meantime', async () => {
      appTokenRepository.find.mockResolvedValue([
        {
          value: 'valid-token',
          expiresAt: new Date(Date.now() + 60_000),
          applicationRegistration: buildRegistration({
            ownerWorkspaceId: 'other-workspace',
          }),
        } as unknown as AppTokenEntity,
      ]);

      const pending = await service.findPendingClaimsForWorkspace(WORKSPACE_ID);

      expect(pending).toEqual([]);
    });
  });

  describe('cancelClaim', () => {
    it('deletes the workspace claim token and reports success', async () => {
      appTokenRepository.delete.mockResolvedValue({
        affected: 1,
        raw: [],
      });

      const cancelled = await service.cancelClaim({
        applicationRegistrationId: REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(appTokenRepository.delete).toHaveBeenCalledWith({
        applicationRegistrationId: REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
        type: AppTokenType.ApplicationRegistrationClaimToken,
      });
      expect(cancelled).toBe(true);
    });

    it('reports false when there was nothing to cancel', async () => {
      appTokenRepository.delete.mockResolvedValue({
        affected: 0,
        raw: [],
      });

      const cancelled = await service.cancelClaim({
        applicationRegistrationId: REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(cancelled).toBe(false);
    });
  });

  describe('verifyClaim', () => {
    const buildClaimToken = (
      overrides: Partial<AppTokenEntity> = {},
    ): AppTokenEntity =>
      ({
        id: 'token-1',
        applicationRegistrationId: REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
        type: AppTokenType.ApplicationRegistrationClaimToken,
        value: 'valid-token',
        expiresAt: new Date(Date.now() + 60_000),
        ...overrides,
      }) as AppTokenEntity;

    it('throws when no claim is in progress', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      appTokenRepository.findOne.mockResolvedValue(null);

      await expectException(
        service.verifyClaim({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
        }),
        ApplicationRegistrationExceptionCode.CLAIM_NOT_STARTED,
      );
    });

    it('clears stale challenges when ownership is already settled', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration({ ownerWorkspaceId: 'other-workspace' }),
      );

      await expectException(
        service.verifyClaim({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
        }),
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_ALREADY_OWNED,
      );
      expect(appTokenRepository.delete).toHaveBeenCalledWith({
        applicationRegistrationId: REGISTRATION_ID,
        type: AppTokenType.ApplicationRegistrationClaimToken,
      });
    });

    it('deletes and rejects an expired claim', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      appTokenRepository.findOne.mockResolvedValue(
        buildClaimToken({ expiresAt: new Date(Date.now() - 1_000) }),
      );

      await expectException(
        service.verifyClaim({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
        }),
        ApplicationRegistrationExceptionCode.CLAIM_EXPIRED,
      );
      expect(appTokenRepository.delete).toHaveBeenCalledWith('token-1');
    });

    it('rejects when no claim code is published', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      appTokenRepository.findOne.mockResolvedValue(buildClaimToken());
      mockedAxios.get.mockResolvedValue({ data: { name: 'my-twenty-app' } });

      await expectException(
        service.verifyClaim({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
        }),
        ApplicationRegistrationExceptionCode.CLAIM_CODE_NOT_FOUND,
      );
    });

    it('reports a registry outage without blaming the claim code', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      appTokenRepository.findOne.mockResolvedValue(buildClaimToken());
      mockedAxios.get.mockRejectedValue(new Error('ETIMEDOUT'));

      await expectException(
        service.verifyClaim({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
        }),
        ApplicationRegistrationExceptionCode.CLAIM_CODE_CHECK_UNAVAILABLE,
      );
    });

    it('rejects when the published claim code does not match', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      appTokenRepository.findOne.mockResolvedValue(buildClaimToken());
      mockedAxios.get.mockResolvedValue({
        data: { twenty: { claimCode: 'wrong-token' } },
      });

      await expectException(
        service.verifyClaim({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
        }),
        ApplicationRegistrationExceptionCode.CLAIM_CODE_MISMATCH,
      );
    });

    it('claims ownership and clears pending claims on a match', async () => {
      const claimed = buildRegistration({ ownerWorkspaceId: WORKSPACE_ID });

      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      appTokenRepository.findOne.mockResolvedValue(buildClaimToken());
      mockedAxios.get.mockResolvedValue({
        data: { twenty: { claimCode: 'valid-token' } },
      });
      applicationRegistrationService.claimOwnership.mockResolvedValue(claimed);

      const result = await service.verifyClaim({
        applicationRegistrationId: REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
      });

      expect(
        applicationRegistrationService.claimOwnership,
      ).toHaveBeenCalledWith({
        applicationRegistrationId: REGISTRATION_ID,
        claimingWorkspaceId: WORKSPACE_ID,
      });
      expect(appTokenRepository.delete).toHaveBeenCalledWith({
        applicationRegistrationId: REGISTRATION_ID,
        type: AppTokenType.ApplicationRegistrationClaimToken,
      });
      expect(result).toBe(claimed);
    });

    it('clears pending claims when a concurrent claimer already won', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      appTokenRepository.findOne.mockResolvedValue(buildClaimToken());
      mockedAxios.get.mockResolvedValue({
        data: { twenty: { claimCode: 'valid-token' } },
      });
      applicationRegistrationService.claimOwnership.mockRejectedValue(
        new ApplicationRegistrationException(
          'Application registration is already owned by a workspace',
          ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_ALREADY_OWNED,
        ),
      );

      await expectException(
        service.verifyClaim({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
        }),
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_ALREADY_OWNED,
      );
      expect(appTokenRepository.delete).toHaveBeenCalledWith({
        applicationRegistrationId: REGISTRATION_ID,
        type: AppTokenType.ApplicationRegistrationClaimToken,
      });
    });
  });
});
