import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import axios from 'axios';
import { type Repository } from 'typeorm';

import { ApplicationRegistrationClaimEntity } from 'src/engine/core-modules/application/application-registration/application-registration-claim.entity';
import { ApplicationRegistrationClaimService } from 'src/engine/core-modules/application/application-registration/application-registration-claim.service';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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
  let claimRepository: jest.Mocked<
    Repository<ApplicationRegistrationClaimEntity>
  >;
  let applicationRegistrationService: jest.Mocked<ApplicationRegistrationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationClaimService,
        {
          provide: getRepositoryToken(ApplicationRegistrationClaimEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn((entity) => entity),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
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
    claimRepository = module.get(
      getRepositoryToken(ApplicationRegistrationClaimEntity),
    );
    applicationRegistrationService = module.get(ApplicationRegistrationService);
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

    it('creates a new claim and returns the challenge', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      claimRepository.findOne.mockResolvedValue(null);

      const challenge = await service.startClaim({
        applicationRegistrationId: REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
        userId: 'user-1',
      });

      expect(claimRepository.save).toHaveBeenCalled();
      expect(claimRepository.update).not.toHaveBeenCalled();
      expect(challenge.sourcePackage).toBe('my-twenty-app');
      expect(challenge.token).toHaveLength(32);
      expect(challenge.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('regenerates the token on an existing claim', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      claimRepository.findOne.mockResolvedValue({
        id: 'claim-1',
        token: 'old-token',
      } as ApplicationRegistrationClaimEntity);

      const challenge = await service.startClaim({
        applicationRegistrationId: REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
        userId: 'user-1',
      });

      expect(claimRepository.update).toHaveBeenCalledWith(
        'claim-1',
        expect.objectContaining({ token: challenge.token }),
      );
      expect(claimRepository.save).not.toHaveBeenCalled();
      expect(challenge.token).not.toBe('old-token');
    });
  });

  describe('verifyClaim', () => {
    const buildClaim = (
      overrides: Partial<ApplicationRegistrationClaimEntity> = {},
    ): ApplicationRegistrationClaimEntity =>
      ({
        id: 'claim-1',
        applicationRegistrationId: REGISTRATION_ID,
        workspaceId: WORKSPACE_ID,
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 60_000),
        ...overrides,
      }) as ApplicationRegistrationClaimEntity;

    it('throws when no claim is in progress', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      claimRepository.findOne.mockResolvedValue(null);

      await expectException(
        service.verifyClaim({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
        }),
        ApplicationRegistrationExceptionCode.CLAIM_NOT_STARTED,
      );
    });

    it('deletes and rejects an expired claim', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      claimRepository.findOne.mockResolvedValue(
        buildClaim({ expiresAt: new Date(Date.now() - 1_000) }),
      );

      await expectException(
        service.verifyClaim({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
        }),
        ApplicationRegistrationExceptionCode.CLAIM_EXPIRED,
      );
      expect(claimRepository.delete).toHaveBeenCalledWith('claim-1');
    });

    it('rejects when no claim code is published', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      claimRepository.findOne.mockResolvedValue(buildClaim());
      mockedAxios.get.mockResolvedValue({ data: { name: 'my-twenty-app' } });

      await expectException(
        service.verifyClaim({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
        }),
        ApplicationRegistrationExceptionCode.CLAIM_CODE_NOT_FOUND,
      );
    });

    it('rejects when the published claim code does not match', async () => {
      applicationRegistrationService.findOneByIdGlobal.mockResolvedValue(
        buildRegistration(),
      );
      claimRepository.findOne.mockResolvedValue(buildClaim());
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
      claimRepository.findOne.mockResolvedValue(buildClaim());
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
      expect(claimRepository.delete).toHaveBeenCalledWith({
        applicationRegistrationId: REGISTRATION_ID,
      });
      expect(result).toBe(claimed);
    });
  });
});
