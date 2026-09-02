import { QueryFailedError } from 'typeorm';

import { ApplicationAsyncOperationService } from 'src/engine/core-modules/application/application-async-operation/application-async-operation.service';
import { type ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { type MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { type ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

const WORKSPACE_ID = 'workspace-id';
const UNIVERSAL_IDENTIFIER = 'universal-identifier';
const APP_REGISTRATION_ID = 'app-registration-id';
const APPLICATION_ID = 'application-id';

const APP_REGISTRATION = {
  id: APP_REGISTRATION_ID,
  universalIdentifier: UNIVERSAL_IDENTIFIER,
  name: 'My App',
  sourceType: ApplicationRegistrationSourceType.NPM,
  latestAvailableVersion: '1.1.0',
} as ApplicationRegistrationEntity;

const INSTALLED_APPLICATION = {
  id: APPLICATION_ID,
  universalIdentifier: UNIVERSAL_IDENTIFIER,
  workspaceId: WORKSPACE_ID,
  version: '1.0.0',
  state: ApplicationState.INSTALLED,
  canBeUninstalled: true,
} as ApplicationEntity;

describe('ApplicationAsyncOperationService', () => {
  let applicationService: {
    findByUniversalIdentifier: jest.Mock;
    findByApplicationRegistrationId: jest.Mock;
    create: jest.Mock;
    transitionState: jest.Mock;
    transitionStateBestEffort: jest.Mock;
  };
  let applicationSyncService: { uninstallApplication: jest.Mock };
  let applicationVersionValidationService: {
    validateVersionProgression: jest.Mock;
  };
  let marketplaceQueryService: {
    findRegistrationByUniversalIdentifier: jest.Mock;
  };
  let messageQueueService: { add: jest.Mock };
  let service: ApplicationAsyncOperationService;

  beforeEach(() => {
    applicationService = {
      findByUniversalIdentifier: jest.fn().mockResolvedValue(null),
      findByApplicationRegistrationId: jest
        .fn()
        .mockResolvedValue(INSTALLED_APPLICATION),
      create: jest.fn().mockResolvedValue({
        ...INSTALLED_APPLICATION,
        version: null,
        state: ApplicationState.INSTALLING,
      }),
      transitionState: jest.fn().mockImplementation(({ nextState }) =>
        Promise.resolve({
          ...INSTALLED_APPLICATION,
          state: nextState,
        }),
      ),
      transitionStateBestEffort: jest.fn().mockResolvedValue(undefined),
    };
    applicationSyncService = {
      uninstallApplication: jest.fn().mockResolvedValue(undefined),
    };
    applicationVersionValidationService = {
      validateVersionProgression: jest.fn().mockReturnValue({ allowed: true }),
    };
    marketplaceQueryService = {
      findRegistrationByUniversalIdentifier: jest
        .fn()
        .mockResolvedValue(APP_REGISTRATION),
    };
    messageQueueService = { add: jest.fn().mockResolvedValue(undefined) };

    service = new ApplicationAsyncOperationService(
      applicationService as unknown as ApplicationService,
      applicationSyncService as unknown as ApplicationSyncService,
      applicationVersionValidationService as unknown as ApplicationVersionValidationService,
      marketplaceQueryService as unknown as MarketplaceQueryService,
      messageQueueService as unknown as MessageQueueService,
    );
  });

  describe('enqueueInstall', () => {
    it('returns the placeholder it claimed for a fresh install', async () => {
      const application = await service.enqueueInstall({
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
      });

      expect(application.state).toBe(ApplicationState.INSTALLING);
      expect(messageQueueService.add).toHaveBeenCalledWith(
        'InstallApplicationJob',
        expect.objectContaining({ workspaceId: WORKSPACE_ID }),
        expect.objectContaining({ retryLimit: 0 }),
      );
    });

    it('claims an installed application as UPGRADING', async () => {
      applicationService.findByUniversalIdentifier.mockResolvedValue(
        INSTALLED_APPLICATION,
      );

      const application = await service.enqueueInstall({
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
      });

      expect(application.state).toBe(ApplicationState.UPGRADING);
      expect(applicationService.create).not.toHaveBeenCalled();
    });

    it('maps the losing insert of concurrent fresh installs to a conflict', async () => {
      applicationService.create.mockRejectedValue(
        Object.assign(
          new QueryFailedError('insert', [], new Error('duplicate key')),
          { code: '23505' },
        ),
      );

      await expect(
        service.enqueueInstall({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: ApplicationExceptionCode.APPLICATION_OPERATION_IN_PROGRESS,
      });
      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('deletes the placeholder when the enqueue fails', async () => {
      messageQueueService.add.mockRejectedValue(new Error('queue unreachable'));

      await expect(
        service.enqueueInstall({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toThrow('queue unreachable');
      expect(applicationSyncService.uninstallApplication).toHaveBeenCalledWith({
        applicationUniversalIdentifier: UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
        shouldRunUninstallHook: false,
      });
    });

    it('rejects an install of an unpublishable registration before claiming anything', async () => {
      marketplaceQueryService.findRegistrationByUniversalIdentifier.mockResolvedValue(
        {
          ...APP_REGISTRATION,
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        },
      );

      await expect(
        service.enqueueInstall({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: ApplicationExceptionCode.INVALID_INPUT,
      });
      expect(applicationService.create).not.toHaveBeenCalled();
    });

    it('surfaces a version progression failure before claiming anything', async () => {
      applicationService.findByUniversalIdentifier.mockResolvedValue(
        INSTALLED_APPLICATION,
      );
      applicationVersionValidationService.validateVersionProgression.mockReturnValue(
        {
          allowed: false,
          reason: 'SAME_VERSION',
          message: 'already installed',
        },
      );

      await expect(
        service.enqueueInstall({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          version: '1.0.0',
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: ApplicationExceptionCode.APP_ALREADY_INSTALLED,
      });
      expect(applicationService.transitionState).not.toHaveBeenCalled();
    });
  });

  describe('enqueueUpgrade', () => {
    it('reverts the claimed state when the enqueue fails', async () => {
      messageQueueService.add.mockRejectedValue(new Error('queue unreachable'));

      await expect(
        service.enqueueUpgrade({
          appRegistrationId: APP_REGISTRATION_ID,
          targetVersion: '1.1.0',
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toThrow('queue unreachable');
      expect(applicationService.transitionStateBestEffort).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedState: ApplicationState.UPGRADING,
          nextState: ApplicationState.INSTALLED,
        }),
      );
    });

    it('rejects an upgrade of an application that is not installed', async () => {
      applicationService.findByApplicationRegistrationId.mockResolvedValue(
        null,
      );

      await expect(
        service.enqueueUpgrade({
          appRegistrationId: APP_REGISTRATION_ID,
          targetVersion: '1.1.0',
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: ApplicationExceptionCode.APP_NOT_INSTALLED,
      });
    });
  });

  describe('enqueueUninstall', () => {
    it('claims the application as UNINSTALLING', async () => {
      applicationService.findByUniversalIdentifier.mockResolvedValue(
        INSTALLED_APPLICATION,
      );

      const application = await service.enqueueUninstall({
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
      });

      expect(application.state).toBe(ApplicationState.UNINSTALLING);
      expect(messageQueueService.add).toHaveBeenCalledWith(
        'UninstallApplicationJob',
        expect.objectContaining({ universalIdentifier: UNIVERSAL_IDENTIFIER }),
        expect.objectContaining({ retryLimit: 0 }),
      );
    });

    it('rejects an application that cannot be uninstalled', async () => {
      applicationService.findByUniversalIdentifier.mockResolvedValue({
        ...INSTALLED_APPLICATION,
        canBeUninstalled: false,
      });

      await expect(
        service.enqueueUninstall({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toMatchObject({
        code: ApplicationExceptionCode.FORBIDDEN,
      });
      expect(applicationService.transitionState).not.toHaveBeenCalled();
    });

    it('reverts the claimed state when the enqueue fails', async () => {
      applicationService.findByUniversalIdentifier.mockResolvedValue(
        INSTALLED_APPLICATION,
      );
      messageQueueService.add.mockRejectedValue(new Error('queue unreachable'));

      await expect(
        service.enqueueUninstall({
          universalIdentifier: UNIVERSAL_IDENTIFIER,
          workspaceId: WORKSPACE_ID,
        }),
      ).rejects.toThrow('queue unreachable');
      expect(applicationService.transitionStateBestEffort).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedState: ApplicationState.UNINSTALLING,
          nextState: ApplicationState.INSTALLED,
        }),
      );
    });
  });
});
