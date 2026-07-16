import { Injectable } from '@nestjs/common';

import semver from 'semver';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';
import { isDefined } from 'twenty-shared/utils';

export type VersionValidationFailureReason =
  | 'INVALID_REQUIRED_VERSION'
  | 'INVALID_SERVER_VERSION'
  | 'INVALID_WORKSPACE_VERSION'
  | 'INSTANCE_INCOMPATIBLE'
  | 'WORKSPACE_INCOMPATIBLE';

export type VersionValidationResult =
  | { compatible: true }
  | {
      compatible: false;
      reason: VersionValidationFailureReason;
      message: string;
    };

export type VersionProgressionFailureReason =
  | 'INVALID_INCOMING_VERSION'
  | 'SAME_VERSION'
  | 'DOWNGRADE';

export type VersionProgressionResult =
  | { allowed: true }
  | {
      allowed: false;
      reason: VersionProgressionFailureReason;
      message: string;
    };

@Injectable()
export class ApplicationVersionValidationService {
  constructor(
    private readonly upgradeMigrationService: UpgradeMigrationService,
    private readonly upgradeStatusService: UpgradeStatusService,
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

    return this.validateVersionAgainstRange({
      version: inferredServerVersion,
      requiredVersionRange: requiredServerVersion,
      scope: 'instance',
    });
  }

  async validateWorkspaceCompatibility({
    requiredServerVersion,
    workspaceId,
  }: {
    requiredServerVersion: string | undefined;
    workspaceId: string;
  }): Promise<VersionValidationResult> {
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

    const workspaceCompletedVersion =
      await this.upgradeStatusService.getWorkspaceCompletedVersion(workspaceId);

    if (!isDefined(workspaceCompletedVersion)) {
      return {
        compatible: false,
        reason: 'INVALID_WORKSPACE_VERSION',
        message: `Cannot determine the completed upgrade version for workspace ${workspaceId}: no interpretable upgrade cursor found.`,
      };
    }

    return this.validateVersionAgainstRange({
      version: workspaceCompletedVersion,
      requiredVersionRange: requiredServerVersion,
      scope: 'workspace',
    });
  }

  // A current version that is not valid semver never blocks: there is
  // nothing reliable to compare against.
  validateVersionProgression({
    incomingVersion,
    currentVersion,
    universalIdentifier,
    action,
  }: {
    incomingVersion: string;
    currentVersion: string;
    universalIdentifier: string;
    action: 'install' | 'deploy';
  }): VersionProgressionResult {
    if (!isDefined(semver.valid(incomingVersion))) {
      return {
        allowed: false,
        reason: 'INVALID_INCOMING_VERSION',
        message: `Invalid version "${incomingVersion}" in package.json. Must be a valid semver version.`,
      };
    }

    if (!isDefined(semver.valid(currentVersion))) {
      return { allowed: true };
    }

    if (action === 'deploy' && semver.lte(incomingVersion, currentVersion)) {
      return {
        allowed: false,
        reason: semver.eq(incomingVersion, currentVersion)
          ? 'SAME_VERSION'
          : 'DOWNGRADE',
        message: `Cannot deploy ${universalIdentifier}@${incomingVersion}: version must be higher than the currently deployed version ${currentVersion}. Please bump the version in package.json.`,
      };
    }

    if (action === 'install' && semver.eq(incomingVersion, currentVersion)) {
      return {
        allowed: false,
        reason: 'SAME_VERSION',
        message: `${universalIdentifier}@${incomingVersion} is already installed in this workspace.`,
      };
    }

    if (action === 'install' && semver.lt(incomingVersion, currentVersion)) {
      return {
        allowed: false,
        reason: 'DOWNGRADE',
        message: `Cannot install ${universalIdentifier}@${incomingVersion}: version ${currentVersion} is already installed and downgrading is not allowed.`,
      };
    }

    return { allowed: true };
  }

  private validateVersionAgainstRange({
    version,
    requiredVersionRange,
    scope,
  }: {
    version: string | null;
    requiredVersionRange: string;
    scope: 'instance' | 'workspace';
  }): VersionValidationResult {
    if (!isDefined(version) || !isDefined(semver.valid(version))) {
      return scope === 'workspace'
        ? {
            compatible: false,
            reason: 'INVALID_WORKSPACE_VERSION',
            message: `Cannot verify workspace compatibility: workspace completed version "${version ?? 'undefined'}" is not a valid semver version.`,
          }
        : {
            compatible: false,
            reason: 'INVALID_SERVER_VERSION',
            message: `Cannot verify server compatibility: inferred server version "${version ?? 'undefined'}" is not a valid semver version.`,
          };
    }

    if (!semver.satisfies(version, requiredVersionRange)) {
      return scope === 'workspace'
        ? {
            compatible: false,
            reason: 'WORKSPACE_INCOMPATIBLE',
            message: `App requires Twenty server ${requiredVersionRange} but this workspace has only completed the upgrade to ${version}.`,
          }
        : {
            compatible: false,
            reason: 'INSTANCE_INCOMPATIBLE',
            message: `App requires Twenty server ${requiredVersionRange} but this server is ${version}.`,
          };
    }

    return { compatible: true };
  }
}
