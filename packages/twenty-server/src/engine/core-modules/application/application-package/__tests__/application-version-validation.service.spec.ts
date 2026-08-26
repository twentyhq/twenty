import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';

describe('ApplicationVersionValidationService', () => {
  let service: ApplicationVersionValidationService;

  const upgradeStatusService = {
    getInstanceCompletedVersion: jest.fn(),
    getWorkspaceCompletedVersion: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationVersionValidationService,
        {
          provide: UpgradeStatusService,
          useValue: upgradeStatusService,
        },
      ],
    }).compile();

    service = module.get(ApplicationVersionValidationService);
  });

  describe('validateManyServerCompatibilities', () => {
    it('returns compatible for every app without fetching the instance version when no range is declared', async () => {
      const results = await service.validateManyServerCompatibilities([
        undefined,
        null,
      ]);

      expect(results).toEqual([{ compatible: true }, { compatible: true }]);
      expect(
        upgradeStatusService.getInstanceCompletedVersion,
      ).toHaveBeenCalledTimes(0);
    });

    it('fetches the instance version once for the whole batch', async () => {
      upgradeStatusService.getInstanceCompletedVersion.mockResolvedValue(
        '2.5.0',
      );

      const results = await service.validateManyServerCompatibilities([
        '>=2.0.0',
        '>=3.0.0',
        undefined,
      ]);

      expect(
        upgradeStatusService.getInstanceCompletedVersion,
      ).toHaveBeenCalledTimes(1);
      expect(results[0]).toEqual({ compatible: true });
      expect(results[1]).toMatchObject({
        compatible: false,
        reason: 'INSTANCE_INCOMPATIBLE',
      });
      expect(results[2]).toEqual({ compatible: true });
    });

    it('flags an invalid semver range as incompatible', async () => {
      upgradeStatusService.getInstanceCompletedVersion.mockResolvedValue(
        '2.5.0',
      );

      const results = await service.validateManyServerCompatibilities([
        'not-a-range',
      ]);

      expect(results[0]).toMatchObject({
        compatible: false,
        reason: 'INVALID_REQUIRED_VERSION',
      });
    });

    it('flags every constrained app as incompatible when the instance version cannot be determined', async () => {
      upgradeStatusService.getInstanceCompletedVersion.mockResolvedValue(null);

      const results = await service.validateManyServerCompatibilities([
        '>=2.0.0',
        undefined,
      ]);

      expect(results[0]).toMatchObject({
        compatible: false,
        reason: 'INVALID_SERVER_VERSION',
      });
      expect(results[1]).toEqual({ compatible: true });
    });
  });

  describe('validateServerCompatibility', () => {
    it('validates a single range against the instance version', async () => {
      upgradeStatusService.getInstanceCompletedVersion.mockResolvedValue(
        '2.5.0',
      );

      await expect(
        service.validateServerCompatibility('>=2.0.0'),
      ).resolves.toEqual({ compatible: true });
      await expect(
        service.validateServerCompatibility('>=3.0.0'),
      ).resolves.toMatchObject({
        compatible: false,
        reason: 'INSTANCE_INCOMPATIBLE',
      });
    });
  });
});
