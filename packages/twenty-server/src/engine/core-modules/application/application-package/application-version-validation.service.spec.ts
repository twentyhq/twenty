import { Test } from '@nestjs/testing';

import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';

describe('ApplicationVersionValidationService', () => {
  let service: ApplicationVersionValidationService;
  let getInferredVersion: jest.Mock;
  let getWorkspaceCompletedVersion: jest.Mock;

  beforeEach(async () => {
    getInferredVersion = jest.fn();
    getWorkspaceCompletedVersion = jest.fn();

    const module = await Test.createTestingModule({
      providers: [
        ApplicationVersionValidationService,
        {
          provide: UpgradeMigrationService,
          useValue: { getInferredVersion },
        },
        {
          provide: UpgradeStatusService,
          useValue: { getWorkspaceCompletedVersion },
        },
      ],
    }).compile();

    service = module.get(ApplicationVersionValidationService);
  });

  describe('validateServerCompatibility', () => {
    it('should be compatible when no required version is declared', async () => {
      await expect(
        service.validateServerCompatibility(undefined),
      ).resolves.toEqual({ compatible: true });
    });

    it('should reject an invalid semver range', async () => {
      const result = await service.validateServerCompatibility('not-semver');

      expect(result).toMatchObject({
        compatible: false,
        reason: 'INVALID_REQUIRED_VERSION',
      });
    });

    it('should be compatible when the inferred instance version satisfies the range', async () => {
      getInferredVersion.mockResolvedValue('2.19.0');

      await expect(
        service.validateServerCompatibility('>=2.19.0'),
      ).resolves.toEqual({ compatible: true });
    });

    it('should be incompatible when the inferred instance version does not satisfy the range', async () => {
      getInferredVersion.mockResolvedValue('2.18.0');

      const result = await service.validateServerCompatibility('>=2.19.0');

      expect(result).toMatchObject({
        compatible: false,
        reason: 'INSTANCE_INCOMPATIBLE',
      });
    });

    it('should fail when the inferred instance version is not valid semver', async () => {
      getInferredVersion.mockResolvedValue(null);

      const result = await service.validateServerCompatibility('>=2.19.0');

      expect(result).toMatchObject({
        compatible: false,
        reason: 'INVALID_SERVER_VERSION',
      });
    });
  });

  describe('validateWorkspaceCompatibility', () => {
    it('should be compatible when no required version is declared', async () => {
      await expect(
        service.validateWorkspaceCompatibility({
          requiredServerVersion: undefined,
          workspaceId: 'ws-1',
        }),
      ).resolves.toEqual({ compatible: true });

      expect(getWorkspaceCompletedVersion).not.toHaveBeenCalled();
    });

    it('should reject an invalid semver range', async () => {
      const result = await service.validateWorkspaceCompatibility({
        requiredServerVersion: 'not-semver',
        workspaceId: 'ws-1',
      });

      expect(result).toMatchObject({
        compatible: false,
        reason: 'INVALID_REQUIRED_VERSION',
      });
    });

    it('should be compatible when the workspace completed version satisfies the range', async () => {
      getWorkspaceCompletedVersion.mockResolvedValue('2.19.0');

      await expect(
        service.validateWorkspaceCompatibility({
          requiredServerVersion: '>=2.19.0',
          workspaceId: 'ws-1',
        }),
      ).resolves.toEqual({ compatible: true });

      expect(getWorkspaceCompletedVersion).toHaveBeenCalledWith('ws-1');
      expect(getInferredVersion).not.toHaveBeenCalled();
    });

    it('should be incompatible when the workspace has only completed an earlier version', async () => {
      getWorkspaceCompletedVersion.mockResolvedValue('2.18.0');

      const result = await service.validateWorkspaceCompatibility({
        requiredServerVersion: '>=2.19.0',
        workspaceId: 'ws-1',
      });

      expect(result).toMatchObject({
        compatible: false,
        reason: 'WORKSPACE_INCOMPATIBLE',
        message:
          'App requires Twenty server >=2.19.0 but this workspace has only completed the upgrade to 2.18.0.',
      });
    });

    it('should be incompatible when the workspace has no interpretable upgrade cursor', async () => {
      getWorkspaceCompletedVersion.mockResolvedValue(null);

      const result = await service.validateWorkspaceCompatibility({
        requiredServerVersion: '>=2.19.0',
        workspaceId: 'ws-1',
      });

      expect(result).toMatchObject({
        compatible: false,
        reason: 'INVALID_WORKSPACE_VERSION',
        message:
          'Cannot determine the completed upgrade version for workspace ws-1: no interpretable upgrade cursor found.',
      });
      expect(getInferredVersion).not.toHaveBeenCalled();
    });
  });

  describe('validateVersionProgression', () => {
    it('should reject an invalid incoming version', () => {
      const result = service.validateVersionProgression({
        incomingVersion: 'not-semver',
        currentVersion: '1.0.0',
        universalIdentifier: 'my-app',
        action: 'install',
      });

      expect(result).toMatchObject({
        allowed: false,
        reason: 'INVALID_INCOMING_VERSION',
      });
    });

    it('should allow any progression when the current version is not valid semver', () => {
      expect(
        service.validateVersionProgression({
          incomingVersion: '1.0.0',
          currentVersion: 'unknown',
          universalIdentifier: 'my-app',
          action: 'install',
        }),
      ).toEqual({ allowed: true });
    });

    it('should allow a higher version', () => {
      for (const action of ['install', 'deploy'] as const) {
        expect(
          service.validateVersionProgression({
            incomingVersion: '1.1.0',
            currentVersion: '1.0.0',
            universalIdentifier: 'my-app',
            action,
          }),
        ).toEqual({ allowed: true });
      }
    });

    it('should reject the same version on install as already installed', () => {
      const result = service.validateVersionProgression({
        incomingVersion: '1.0.0',
        currentVersion: '1.0.0',
        universalIdentifier: 'my-app',
        action: 'install',
      });

      expect(result).toMatchObject({
        allowed: false,
        reason: 'SAME_VERSION',
        message: 'my-app@1.0.0 is already installed in this workspace.',
      });
    });

    it('should reject a lower version on install as a downgrade', () => {
      const result = service.validateVersionProgression({
        incomingVersion: '0.9.0',
        currentVersion: '1.0.0',
        universalIdentifier: 'my-app',
        action: 'install',
      });

      expect(result).toMatchObject({
        allowed: false,
        reason: 'DOWNGRADE',
      });
    });

    it('should reject same and lower versions on deploy with the bump message', () => {
      for (const [incomingVersion, reason] of [
        ['1.0.0', 'SAME_VERSION'],
        ['0.9.0', 'DOWNGRADE'],
      ] as const) {
        const result = service.validateVersionProgression({
          incomingVersion,
          currentVersion: '1.0.0',
          universalIdentifier: 'my-app',
          action: 'deploy',
        });

        expect(result).toMatchObject({
          allowed: false,
          reason,
          message: `Cannot deploy my-app@${incomingVersion}: version must be higher than the currently deployed version 1.0.0. Please bump the version in package.json.`,
        });
      }
    });
  });
});
