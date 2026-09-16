import { Test } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { SignInUpService } from 'src/engine/core-modules/auth/services/sign-in-up.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SubdomainManagerService } from 'src/engine/core-modules/domain/subdomain-manager/services/subdomain-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('SignInUpService stock rollback', () => {
  const buildService = async () => {
    const rollback = jest.fn();
    const save = jest.fn(async (_entity: unknown, value: unknown) => value);
    const transaction = jest.fn(
      async (
        callback: (manager: {
          queryRunner: { manager: { save: typeof save } };
        }) => Promise<unknown>,
      ) => {
        try {
          return await callback({ queryRunner: { manager: { save } } });
        } catch (error) {
          await rollback();
          throw error;
        }
      },
    );
    const createWorkspaceCustomApplication = jest.fn();
    const invalidateStorageStock = jest.fn();
    const billingService = {
      isBillingEnabled: () => true,
      ensureBillingCustomer: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        SignInUpService,
        { provide: getDataSourceToken(), useValue: { transaction } },
        {
          provide: ApplicationService,
          useValue: { createWorkspaceCustomApplication },
        },
        { provide: FileStorageService, useValue: { invalidateStorageStock } },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: { count: async () => 0, create: (value: unknown) => value },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: { count: async () => 1 },
        },
        { provide: TwentyConfigService, useValue: { get: () => false } },
        {
          provide: SubdomainManagerService,
          useValue: { generateSubdomain: async () => 'workspace' },
        },
        {
          provide: WorkspaceCacheService,
          useValue: { invalidateAndRecompute: jest.fn() },
        },
        {
          provide: EventLogEmitterService,
          useValue: {
            createContext: () => ({ insertWorkspaceEvent: jest.fn() }),
          },
        },
        { provide: BillingService, useValue: billingService },
      ],
    })
      .useMocker(() => ({}))
      .compile();
    const user = Object.assign(new UserEntity(), {
      id: 'user-1',
      email: 'test@gmail.com',
    });
    const signUp = () =>
      module
        .get(SignInUpService)
        .signUpOnNewWorkspace(
          { type: 'existingUser', existingUser: user },
          { displayName: 'Workspace' },
        );

    return {
      signUp,
      transaction,
      rollback,
      createWorkspaceCustomApplication,
      invalidateStorageStock,
      billingService,
      user,
    };
  };

  it('invalidates stock after a file-writing application creation rolls back', async () => {
    const {
      signUp,
      rollback,
      createWorkspaceCustomApplication,
      invalidateStorageStock,
    } = await buildService();
    const failure = new Error('package file write failed');
    createWorkspaceCustomApplication.mockRejectedValue(failure);

    await expect(signUp()).rejects.toBe(failure);

    const [scope] = createWorkspaceCustomApplication.mock.calls[0];
    expect(invalidateStorageStock).toHaveBeenCalledWith(scope);
    expect(rollback.mock.invocationCallOrder[0]).toBeLessThan(
      invalidateStorageStock.mock.invocationCallOrder[0],
    );
  });

  it.each([false, true])(
    'does not invalidate committed stock when post-commit billing fails: %s',
    async (failsAfterCommit) => {
      const {
        signUp,
        transaction,
        invalidateStorageStock,
        billingService,
        user,
      } = await buildService();
      transaction.mockResolvedValue({
        user,
        workspace: { id: 'workspace-1' },
        customApplicationUniversalIdentifier: 'application',
      });
      const failure = new Error('billing failed');
      if (failsAfterCommit) {
        billingService.ensureBillingCustomer.mockRejectedValue(failure);
        await expect(signUp()).rejects.toBe(failure);
      } else {
        await expect(signUp()).resolves.toBeDefined();
      }
      expect(invalidateStorageStock).not.toHaveBeenCalled();
    },
  );
});
