import { Injectable } from '@nestjs/common';

import semver from 'semver';
import { isDefined } from 'twenty-shared/utils';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';

export type VersionValidationFailureReason =
  | 'INVALID_REQUIRED_VERSION'
  | 'INVALID_SERVER_VERSION'
  | 'INCOMPATIBLE';

export type VersionValidationResult =
  | { compatible: true }
  | {
      compatible: false;
      reason: VersionValidationFailureReason;
      message: string;
    };

@Injectable()
export class ApplicationVersionValidationService {
  constructor(
    private readonly upgradeMigrationService: UpgradeMigrationService,
  ) {}

  async validateServerCompatibility(
    requiredServerVersion: string | undefined,
  ): Promise<VersionValidationResult> {
    if (!isDefined(requiredServerVersion)) {
      return { compatible: true };
    }

    if (!isDefined(semver.validRange(requiredServerVersion))) {
      return {
        compatible: false,
        reason: 'INVALID_REQUIRED_VERSION',
        message: `App manifest declares invalid engines.twenty value "${requiredServerVersion}". Must be a valid semver range.`,
      };
    }

    const inferredServerVersion =
      await this.upgradeMigrationService.getInferredVersion();

    if (
      !isDefined(inferredServerVersion) ||
      !isDefined(semver.valid(inferredServerVersion))
    ) {
      return {
        compatible: false,
        reason: 'INVALID_SERVER_VERSION',
        message: `Cannot verify server compatibility: inferred server version "${inferredServerVersion ?? 'undefined'}" is not a valid semver version.`,
      };
    }

    if (!semver.satisfies(inferredServerVersion, requiredServerVersion)) {
      return {
        compatible: false,
        reason: 'INCOMPATIBLE',
        message: `App requires Twenty server ${requiredServerVersion} but this server is ${inferredServerVersion}.`,
      };
    }

    return { compatible: true };
  }
}
