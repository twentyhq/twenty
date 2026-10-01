import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';

const WORKSPACE_ID = 'workspace-id';
const REGISTRATION_ID = 'registration-id';
const UNIVERSAL_IDENTIFIER = 'application-uid';

const buildRegistration = (ownerWorkspaceId: string | null) =>
  ({
    id: REGISTRATION_ID,
    universalIdentifier: UNIVERSAL_IDENTIFIER,
    ownerWorkspaceId,
  }) as ApplicationRegistrationEntity;

describe('ApplicationRegistrationService - workspace ownership', () => {
  let service: ApplicationRegistrationService;
  let applicationRegistrationRepository: { findOne: jest.Mock };

  beforeEach(async () => {
    applicationRegistrationRepository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: applicationRegistrationRepository,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: ApplicationRegistrationVariableService,
          useValue: {},
        },
        {
          provide: ApplicationRegistrationAssetUrlService,
          useValue: {},
        },
        { provide: ServerFileStorageService, useValue: {} },
        { provide: CacheLockService, useValue: {} },
        { provide: CoreEntityCacheService, useValue: {} },
        { provide: MetricsService, useValue: {} },
        {
          provide: getQueueToken(MessageQueue.applicationUpgradeQueue),
          useValue: {},
        },
        { provide: WorkspaceEventBroadcaster, useValue: {} },
      ],
    }).compile();

    service = module.get<ApplicationRegistrationService>(
      ApplicationRegistrationService,
    );
  });

  describe.each([
    {
      method: 'findOneOwnedByWorkspaceOrThrow',
      find: () =>
        service.findOneOwnedByWorkspaceOrThrow({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          workspaceId: WORKSPACE_ID,
        }),
      expectedWhere: { universalIdentifier: UNIVERSAL_IDENTIFIER },
    },
    {
      method: 'findOneByIdOwnedByWorkspaceOrThrow',
      find: () =>
        service.findOneByIdOwnedByWorkspaceOrThrow({
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: WORKSPACE_ID,
        }),
      expectedWhere: { id: REGISTRATION_ID },
    },
  ])('$method', ({ find, expectedWhere }) => {
    it('should return the registration owned by the workspace', async () => {
      const registration = buildRegistration(WORKSPACE_ID);

      applicationRegistrationRepository.findOne.mockResolvedValueOnce(
        registration,
      );

      await expect(find()).resolves.toBe(registration);
      expect(applicationRegistrationRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: expectedWhere }),
      );
    });

    it('should refuse a registration owned by another workspace', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValueOnce(
        buildRegistration('other-workspace-id'),
      );

      await expect(find()).rejects.toMatchObject({
        code: ApplicationExceptionCode.FORBIDDEN,
        message: expect.stringContaining('registered to another workspace'),
      });
    });

    it('should refuse a registration claimed by no workspace', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValueOnce(
        buildRegistration(null),
      );

      await expect(find()).rejects.toMatchObject({
        code: ApplicationExceptionCode.FORBIDDEN,
        message: expect.stringContaining('claimed by no workspace'),
      });
    });

    it('should refuse when no registration matches', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValueOnce(null);

      await expect(find()).rejects.toMatchObject({
        code: ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      });
    });
  });
});
