import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { type DataSource } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { BillingCreditService } from 'src/engine/core-modules/billing/services/billing-credit.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FileCorePictureService } from 'src/engine/core-modules/file/file-core-picture/services/file-core-picture.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

describe('SignInUpService', () => {
  let service: SignInUpService;

  const uploadWorkspaceLogoFromUrl = jest.fn();
  const deleteCorePicture = jest.fn();
  const captureExceptions = jest.fn();
  const updateWorkspace = jest.fn();
  const insertWorkspaceEvent = jest.fn();

  const existingUser = {
    id: 'user-id',
    email: 'person@acme.com',
    firstName: 'Person',
    lastName: 'Acme',
    canAccessFullAdminPanel: false,
  } as UserEntity;

  const createWorkspace = () =>
    service.signUpOnNewWorkspace(
      { type: 'existingUser', existingUser },
      { displayName: 'Acme' },
    );

  const flushMicrotasks = async () => {
    for (let index = 0; index < 20; index++) {
      await Promise.resolve();
    }
  };

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    updateWorkspace.mockResolvedValue({ affected: 1 });
    deleteCorePicture.mockResolvedValue(undefined);

    const workspaceRepository = {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(
        (workspace: Partial<WorkspaceEntity>) => workspace as WorkspaceEntity,
      ),
      update: updateWorkspace,
    };

    const queryRunner = {
      manager: {
        save: jest.fn(
          async (_entity: unknown, value: unknown) =>
            await Promise.resolve(value),
        ),
      },
    };

    const dataSource = {
      transaction: jest.fn(
        async (
          runInTransaction: (entityManager: {
            queryRunner: typeof queryRunner;
          }) => Promise<unknown>,
        ) => await runInTransaction({ queryRunner }),
      ),
    } as unknown as DataSource;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInUpService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: { count: jest.fn().mockResolvedValue(1) },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: workspaceRepository,
        },
        { provide: WorkspaceInvitationService, useValue: {} },
        {
          provide: UserWorkspaceService,
          useValue: { create: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: OnboardingService,
          useValue: {
            setOnboardingConnectAccountPending: jest
              .fn()
              .mockResolvedValue(undefined),
            setOnboardingCreateProfilePending: jest
              .fn()
              .mockResolvedValue(undefined),
            setOnboardingInstallAppsPending: jest
              .fn()
              .mockResolvedValue(undefined),
            setOnboardingInviteTeamPending: jest
              .fn()
              .mockResolvedValue(undefined),
          },
        },
        { provide: WorkspaceEventEmitter, useValue: {} },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue(false) },
        },
        {
          provide: SubdomainManagerService,
          useValue: {
            generateSubdomain: jest.fn().mockResolvedValue('acme'),
          },
        },
        { provide: UserService, useValue: {} },
        { provide: MetricsService, useValue: {} },
        {
          provide: WorkspaceCacheService,
          useValue: { invalidateAndRecompute: jest.fn() },
        },
        {
          provide: ApplicationService,
          useValue: {
            createWorkspaceCustomApplication: jest.fn().mockResolvedValue({
              universalIdentifier: 'custom-application',
            }),
          },
        },
        {
          provide: FileCorePictureService,
          useValue: { deleteCorePicture, uploadWorkspaceLogoFromUrl },
        },
        {
          provide: ExceptionHandlerService,
          useValue: { captureExceptions },
        },
        { provide: EnterprisePlanService, useValue: {} },
        {
          provide: EventLogEmitterService,
          useValue: {
            createContext: jest.fn().mockReturnValue({ insertWorkspaceEvent }),
          },
        },
        { provide: BillingCreditService, useValue: {} },
        {
          provide: BillingService,
          useValue: { isBillingEnabled: jest.fn().mockReturnValue(false) },
        },
        { provide: getDataSourceToken(), useValue: dataSource },
      ],
    }).compile();

    service = module.get(SignInUpService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('does not wait for an inferred logo and reports its failure', async () => {
    const uploadError = new Error('S3 unavailable');
    let rejectUpload: (error: Error) => void = () => undefined;

    uploadWorkspaceLogoFromUrl.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectUpload = reject;
      }),
    );

    let hasWorkspaceCreationResolved = false;
    const workspaceCreationPromise = createWorkspace().then((result) => {
      hasWorkspaceCreationResolved = true;

      return result;
    });

    await flushMicrotasks();
    const resolvedBeforeLogoUpload = hasWorkspaceCreationResolved;

    rejectUpload(uploadError);

    const { workspace } = await workspaceCreationPromise;
    await flushMicrotasks();

    expect(resolvedBeforeLogoUpload).toBe(true);
    expect(uploadWorkspaceLogoFromUrl).toHaveBeenCalledTimes(1);
    expect(captureExceptions).toHaveBeenCalledTimes(1);
    expect(captureExceptions).toHaveBeenCalledWith([uploadError], {
      workspace: { id: workspace.id },
      additionalData: { source: 'inferred-workspace-logo' },
    });
    expect(updateWorkspace).toHaveBeenCalledTimes(0);
    expect(deleteCorePicture).toHaveBeenCalledTimes(0);
  });

  it('sets the inferred logo after workspace creation', async () => {
    uploadWorkspaceLogoFromUrl.mockResolvedValue({ id: 'logo-file-id' });

    const { workspace } = await createWorkspace();
    await flushMicrotasks();

    expect(uploadWorkspaceLogoFromUrl).toHaveBeenCalledTimes(1);
    expect(uploadWorkspaceLogoFromUrl).toHaveBeenCalledWith({
      imageUrl: 'https://twenty-icons.com/acme.com',
      workspaceId: workspace.id,
      applicationUniversalIdentifier: 'custom-application',
    });
    expect(updateWorkspace).toHaveBeenCalledTimes(1);
    expect(updateWorkspace).toHaveBeenCalledWith(workspace.id, {
      logoFileId: 'logo-file-id',
    });
    expect(captureExceptions).toHaveBeenCalledTimes(0);
    expect(deleteCorePicture).toHaveBeenCalledTimes(0);
  });

  it('deletes an uploaded logo when associating it fails', async () => {
    const associationError = new Error('Database unavailable');

    uploadWorkspaceLogoFromUrl.mockResolvedValue({ id: 'logo-file-id' });
    updateWorkspace.mockRejectedValue(associationError);
    deleteCorePicture.mockResolvedValue(undefined);

    const { workspace } = await createWorkspace();
    await flushMicrotasks();

    expect(uploadWorkspaceLogoFromUrl).toHaveBeenCalledTimes(1);
    expect(updateWorkspace).toHaveBeenCalledTimes(1);
    expect(deleteCorePicture).toHaveBeenCalledTimes(1);
    expect(deleteCorePicture).toHaveBeenCalledWith({
      fileId: 'logo-file-id',
      workspaceId: workspace.id,
    });
    expect(captureExceptions).toHaveBeenCalledTimes(1);
    expect(captureExceptions).toHaveBeenCalledWith([associationError], {
      workspace: { id: workspace.id },
      additionalData: { source: 'inferred-workspace-logo' },
    });
  });

  it('deletes an uploaded logo when its workspace no longer exists', async () => {
    uploadWorkspaceLogoFromUrl.mockResolvedValue({ id: 'logo-file-id' });
    updateWorkspace.mockResolvedValue({ affected: 0 });

    const { workspace } = await createWorkspace();
    await flushMicrotasks();

    expect(uploadWorkspaceLogoFromUrl).toHaveBeenCalledTimes(1);
    expect(updateWorkspace).toHaveBeenCalledTimes(1);
    expect(deleteCorePicture).toHaveBeenCalledTimes(1);
    expect(deleteCorePicture).toHaveBeenCalledWith({
      fileId: 'logo-file-id',
      workspaceId: workspace.id,
    });
    expect(captureExceptions).toHaveBeenCalledTimes(1);
    expect(captureExceptions.mock.calls[0][0][0]).toEqual(
      new Error('Workspace no longer exists for inferred logo'),
    );
  });

  it('reports both association and cleanup failures', async () => {
    const associationError = new Error('Database unavailable');
    const cleanupError = new Error('S3 cleanup unavailable');

    uploadWorkspaceLogoFromUrl.mockResolvedValue({ id: 'logo-file-id' });
    updateWorkspace.mockRejectedValue(associationError);
    deleteCorePicture.mockRejectedValue(cleanupError);

    const { workspace } = await createWorkspace();
    await flushMicrotasks();

    expect(uploadWorkspaceLogoFromUrl).toHaveBeenCalledTimes(1);
    expect(updateWorkspace).toHaveBeenCalledTimes(1);
    expect(deleteCorePicture).toHaveBeenCalledTimes(1);
    expect(captureExceptions).toHaveBeenCalledTimes(2);
    expect(captureExceptions).toHaveBeenNthCalledWith(1, [associationError], {
      workspace: { id: workspace.id },
      additionalData: { source: 'inferred-workspace-logo' },
    });
    expect(captureExceptions).toHaveBeenNthCalledWith(2, [cleanupError], {
      workspace: { id: workspace.id },
      additionalData: { source: 'inferred-workspace-logo-cleanup' },
    });
  });
});
