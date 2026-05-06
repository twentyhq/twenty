import { Injectable } from '@nestjs/common';

import semver from 'semver';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  validateServerCompatibility(
    requiredServerVersion: string | undefined,
  ): VersionValidationResult {
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

    const serverVersion = this.twentyConfigService.get('APP_VERSION');

    if (!isDefined(serverVersion) || !isDefined(semver.valid(serverVersion))) {
      return {
        compatible: false,
        reason: 'INVALID_SERVER_VERSION',
        message: `Cannot verify server compatibility: APP_VERSION "${serverVersion ?? 'undefined'}" is not a valid semver version. Self-hosted instances must set a valid APP_VERSION.`,
      };
    }

    if (!semver.satisfies(serverVersion, requiredServerVersion)) {
      return {
        compatible: false,
        reason: 'INCOMPATIBLE',
        message: `App requires Twenty server ${requiredServerVersion} but this server is ${serverVersion}.`,
      };
    }

    return { compatible: true };
  }
}
