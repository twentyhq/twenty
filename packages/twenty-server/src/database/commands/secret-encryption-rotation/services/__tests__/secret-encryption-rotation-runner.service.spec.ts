import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationRegistrationVariableRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/application-registration-variable-rotation.handler';
import { ApplicationVariableRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/application-variable-rotation.handler';
import { ConnectedAccountTokensRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/connected-account-tokens-rotation.handler';
import { SensitiveConfigStorageRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/sensitive-config-storage-rotation.handler';
import { SigningKeyPrivateKeysRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/signing-key-private-keys-rotation.handler';
import { TotpSecretsRotationHandler } from 'src/database/commands/secret-encryption-rotation/handlers/totp-secrets-rotation.handler';
import { SecretEncryptionRotationRunnerService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-rotation-runner.service';
import { type SecretEncryptionRotationHandler } from 'src/database/commands/secret-encryption-rotation/types/secret-encryption-rotation-handler.type';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

const buildMockHandler = (
  siteName: string,
  remainingBefore: number,
  result: { rotated: number; skipped: number; errors: number },
): SecretEncryptionRotationHandler => ({
  siteName,
  countRemaining: jest.fn().mockResolvedValue(remainingBefore),
  run: jest.fn().mockResolvedValue(result),
});

describe('SecretEncryptionRotationRunnerService', () => {
  const buildModule = async (
    handlers: Record<string, SecretEncryptionRotationHandler>,
    envOverrides: Record<string, string | undefined> = {},
  ): Promise<TestingModule> => {
    return Test.createTestingModule({
      providers: [
        SecretEncryptionRotationRunnerService,
        {
          provide: EnvironmentConfigDriver,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ENCRYPTION_KEY')
                return envOverrides.ENCRYPTION_KEY ?? 'primary-key-secret';
              if (key === 'FALLBACK_ENCRYPTION_KEY')
                return envOverrides.FALLBACK_ENCRYPTION_KEY;
              if (key === 'APP_SECRET') return envOverrides.APP_SECRET;

              return undefined;
            }),
          },
        },
        {
          provide: ConnectedAccountTokensRotationHandler,
          useValue: handlers.connectedAccountTokens,
        },
        {
          provide: ApplicationVariableRotationHandler,
          useValue: handlers.applicationVariable,
        },
        {
          provide: ApplicationRegistrationVariableRotationHandler,
          useValue: handlers.applicationRegistrationVariable,
        },
        {
          provide: SigningKeyPrivateKeysRotationHandler,
          useValue: handlers.signingKeyPrivateKeys,
        },
        {
          provide: SensitiveConfigStorageRotationHandler,
          useValue: handlers.sensitiveConfigStorage,
        },
        {
          provide: TotpSecretsRotationHandler,
          useValue: handlers.totpSecrets,
        },
      ],
    }).compile();
  };

  const buildAllNoOpHandlers = () => ({
    connectedAccountTokens: buildMockHandler('connected-account-tokens', 0, {
      rotated: 0,
      skipped: 0,
      errors: 0,
    }),
    applicationVariable: buildMockHandler('application-variable', 0, {
      rotated: 0,
      skipped: 0,
      errors: 0,
    }),
    applicationRegistrationVariable: buildMockHandler(
      'application-registration-variable',
      0,
      { rotated: 0, skipped: 0, errors: 0 },
    ),
    signingKeyPrivateKeys: buildMockHandler('signing-key-private-keys', 0, {
      rotated: 0,
      skipped: 0,
      errors: 0,
    }),
    sensitiveConfigStorage: buildMockHandler('sensitive-config-storage', 0, {
      rotated: 0,
      skipped: 0,
      errors: 0,
    }),
    totpSecrets: buildMockHandler('totp-secrets', 0, {
      rotated: 0,
      skipped: 0,
      errors: 0,
    }),
  });

  it('runs every handler in order and returns the per-site summary', async () => {
    const handlers = buildAllNoOpHandlers();
    const module = await buildModule(handlers);
    const service = module.get(SecretEncryptionRotationRunnerService);

    const summary = await service.run({ batchSize: 200, dryRun: false });

    expect(summary.results.map((result) => result.siteName)).toEqual([
      'connected-account-tokens',
      'application-variable',
      'application-registration-variable',
      'signing-key-private-keys',
      'sensitive-config-storage',
      'totp-secrets',
    ]);
    expect(handlers.connectedAccountTokens.run).toHaveBeenCalledWith({
      primaryKeyId: expect.any(String),
      batchSize: 200,
      dryRun: false,
    });
  });

  it('threads the --site filter to a single handler and skips the rest', async () => {
    const handlers = buildAllNoOpHandlers();
    const module = await buildModule(handlers);
    const service = module.get(SecretEncryptionRotationRunnerService);

    const summary = await service.run({
      site: 'signing-key-private-keys',
      batchSize: 200,
      dryRun: false,
    });

    expect(summary.results).toHaveLength(1);
    expect(summary.results[0].siteName).toBe('signing-key-private-keys');
    expect(handlers.signingKeyPrivateKeys.run).toHaveBeenCalledTimes(1);
    expect(handlers.connectedAccountTokens.run).not.toHaveBeenCalled();
  });

  it('throws when --site does not match any handler', async () => {
    const handlers = buildAllNoOpHandlers();
    const module = await buildModule(handlers);
    const service = module.get(SecretEncryptionRotationRunnerService);

    await expect(
      service.run({
        site: 'unknown-site',
        batchSize: 200,
        dryRun: false,
      }),
    ).rejects.toThrow(/Unknown rotation site/);
  });

  it('aggregates rotated / skipped / errors per site', async () => {
    const handlers = buildAllNoOpHandlers();

    handlers.connectedAccountTokens = buildMockHandler(
      'connected-account-tokens',
      100,
      { rotated: 95, skipped: 4, errors: 1 },
    );
    handlers.signingKeyPrivateKeys = buildMockHandler(
      'signing-key-private-keys',
      2,
      { rotated: 2, skipped: 0, errors: 0 },
    );

    const module = await buildModule(handlers);
    const service = module.get(SecretEncryptionRotationRunnerService);

    const summary = await service.run({ batchSize: 200, dryRun: false });

    const connectedAccountResult = summary.results.find(
      (result) => result.siteName === 'connected-account-tokens',
    );
    const signingKeyResult = summary.results.find(
      (result) => result.siteName === 'signing-key-private-keys',
    );

    expect(connectedAccountResult).toMatchObject({
      remainingBefore: 100,
      rotated: 95,
      skipped: 4,
      errors: 1,
    });
    expect(signingKeyResult).toMatchObject({
      remainingBefore: 2,
      rotated: 2,
      skipped: 0,
      errors: 0,
    });
  });

  it('exposes a stable site list via listSiteNames', async () => {
    const handlers = buildAllNoOpHandlers();
    const module = await buildModule(handlers);
    const service = module.get(SecretEncryptionRotationRunnerService);

    expect(service.listSiteNames()).toEqual([
      'connected-account-tokens',
      'application-variable',
      'application-registration-variable',
      'signing-key-private-keys',
      'sensitive-config-storage',
      'totp-secrets',
    ]);
  });
});
