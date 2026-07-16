import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import axios from 'axios';
import { isDefined } from 'twenty-shared/utils';
import { MoreThan, type Repository } from 'typeorm';
import { z } from 'zod';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationAssetUrlService } from 'src/engine/core-modules/application/application-registration/application-registration-asset-url.service';
import { ApplicationRegistrationLifecycleEmailService } from 'src/engine/core-modules/application/application-registration/application-registration-lifecycle-email.service';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { type AdminApplicationRegistrationClaimDTO } from 'src/engine/core-modules/application/application-registration/dtos/admin-application-registration-claim.dto';
import { type ApplicationRegistrationClaimChallengeDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-claim-challenge.dto';
import { type PendingApplicationRegistrationClaimDTO } from 'src/engine/core-modules/application/application-registration/dtos/pending-application-registration-claim.dto';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const CLAIM_TOKEN_TTL_MS = 72 * 60 * 60 * 1000;

// The developer adds `"twenty": { "claimCode": "..." }` to package.json, so
// only these fields matter from the published registry document.
const registryPackageClaimSchema = z.object({
  twenty: z
    .object({
      claimCode: z.string().optional(),
    })
    .optional(),
});

type PublishedClaimCodeLookup =
  | { status: 'fetched'; claimCode: string | null }
  | { status: 'unavailable' };

// Claim challenges are stored as APPLICATION_REGISTRATION_CLAIM_TOKEN app
// tokens: one pending row per (registration, workspace), enforced by a
// partial unique index and removed once ownership is settled.
@Injectable()
export class ApplicationRegistrationClaimService {
  private readonly logger = new Logger(
    ApplicationRegistrationClaimService.name,
  );

  constructor(
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationAssetUrlService: ApplicationRegistrationAssetUrlService,
    private readonly applicationRegistrationLifecycleEmailService: ApplicationRegistrationLifecycleEmailService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async startClaim(params: {
    applicationRegistrationId: string;
    workspaceId: string;
    userId: string | null;
  }): Promise<ApplicationRegistrationClaimChallengeDTO> {
    const registration =
      await this.applicationRegistrationService.findOneByIdGlobal(
        params.applicationRegistrationId,
      );

    const sourcePackage = this.assertClaimable(registration);

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + CLAIM_TOKEN_TTL_MS);

    await this.appTokenRepository.upsert(
      {
        applicationRegistrationId: registration.id,
        workspaceId: params.workspaceId,
        userId: params.userId,
        type: AppTokenType.ApplicationRegistrationClaimToken,
        value: token,
        expiresAt,
      },
      {
        conflictPaths: ['applicationRegistrationId', 'workspaceId'],
        indexPredicate: `"type" = '${AppTokenType.ApplicationRegistrationClaimToken}'`,
      },
    );

    return {
      applicationRegistrationId: registration.id,
      sourcePackage,
      token,
      expiresAt,
    };
  }

  // All claims the workspace has started but not yet verified. Claims whose
  // registration got claimed by someone else in the meantime are excluded.
  async findPendingClaimsForWorkspace(
    workspaceId: string,
  ): Promise<PendingApplicationRegistrationClaimDTO[]> {
    const claimTokens = await this.appTokenRepository.find({
      where: {
        workspaceId,
        type: AppTokenType.ApplicationRegistrationClaimToken,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['applicationRegistration'],
      order: { createdAt: 'DESC' },
    });

    return claimTokens.flatMap((claimToken) => {
      const registration = claimToken.applicationRegistration;

      if (
        !isDefined(registration) ||
        isDefined(registration.ownerWorkspaceId) ||
        !isDefined(registration.sourcePackage)
      ) {
        return [];
      }

      return [
        {
          applicationRegistrationId: registration.id,
          universalIdentifier: registration.universalIdentifier,
          name: registration.name,
          logoUrl:
            this.applicationRegistrationAssetUrlService.buildLogoUrl(
              registration,
            ),
          description: registration.description,
          sourcePackage: registration.sourcePackage,
          token: claimToken.value,
          expiresAt: claimToken.expiresAt,
        },
      ];
    });
  }

  async cancelClaim(params: {
    applicationRegistrationId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const deleteResult = await this.appTokenRepository.delete({
      applicationRegistrationId: params.applicationRegistrationId,
      workspaceId: params.workspaceId,
      type: AppTokenType.ApplicationRegistrationClaimToken,
    });

    return (deleteResult.affected ?? 0) > 0;
  }

  async verifyClaim(params: {
    applicationRegistrationId: string;
    workspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const registration =
      await this.applicationRegistrationService.findOneByIdGlobal(
        params.applicationRegistrationId,
      );

    // Ownership already settled by someone else: drop stale challenges so
    // losers of the race don't leave orphaned rows behind.
    if (isDefined(registration.ownerWorkspaceId)) {
      await this.deleteClaimTokens(registration.id);
    }

    const sourcePackage = this.assertClaimable(registration);

    const claimToken = await this.appTokenRepository.findOne({
      where: {
        applicationRegistrationId: registration.id,
        workspaceId: params.workspaceId,
        type: AppTokenType.ApplicationRegistrationClaimToken,
      },
    });

    if (!isDefined(claimToken)) {
      throw new ApplicationRegistrationException(
        'No claim in progress for this workspace',
        ApplicationRegistrationExceptionCode.CLAIM_NOT_STARTED,
      );
    }

    if (claimToken.expiresAt.getTime() < Date.now()) {
      await this.appTokenRepository.delete(claimToken.id);

      throw new ApplicationRegistrationException(
        'Claim has expired',
        ApplicationRegistrationExceptionCode.CLAIM_EXPIRED,
      );
    }

    const lookup = await this.fetchPublishedClaimCode(sourcePackage);

    if (lookup.status === 'unavailable') {
      throw new ApplicationRegistrationException(
        `Could not reach the package registry to verify the claim for ${sourcePackage}. Try again later.`,
        ApplicationRegistrationExceptionCode.CLAIM_CODE_CHECK_UNAVAILABLE,
      );
    }

    if (!isDefined(lookup.claimCode)) {
      throw new ApplicationRegistrationException(
        `No claim code found in published package ${sourcePackage}`,
        ApplicationRegistrationExceptionCode.CLAIM_CODE_NOT_FOUND,
      );
    }

    if (lookup.claimCode !== claimToken.value) {
      throw new ApplicationRegistrationException(
        `Claim code mismatch for package ${sourcePackage}`,
        ApplicationRegistrationExceptionCode.CLAIM_CODE_MISMATCH,
      );
    }

    let claimed: ApplicationRegistrationEntity;

    try {
      claimed = await this.applicationRegistrationService.claimOwnership({
        applicationRegistrationId: registration.id,
        claimingWorkspaceId: params.workspaceId,
      });
    } catch (error) {
      // A concurrent claimer won the race: ownership is settled either way,
      // so pending challenges are no longer actionable.
      if (
        error instanceof ApplicationRegistrationException &&
        error.code ===
          ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_ALREADY_OWNED
      ) {
        await this.deleteClaimTokens(registration.id);
      }

      throw error;
    }

    // Ownership is settled; drop any pending challenges (including losers of a
    // concurrent race from other workspaces).
    await this.deleteClaimTokens(registration.id);

    // Best-effort notification: ownership is already assigned, so a failure
    // here must not fail the claim.
    try {
      const claimingWorkspace = await this.workspaceRepository.findOne({
        where: { id: params.workspaceId },
      });

      await this.applicationRegistrationLifecycleEmailService.sendApplicationClaimedEmails(
        {
          registration: claimed,
          workspaceDisplayName:
            claimingWorkspace?.displayName ?? params.workspaceId,
          claimingUserId: claimToken.userId,
        },
      );
    } catch (error) {
      this.logger.warn(
        `Failed to send claim notification emails for registration ${registration.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return claimed;
  }

  // Admin view: the settled owner workspace (if any) followed by workspaces
  // with a pending, unexpired claim challenge.
  async findClaimsForRegistration(
    applicationRegistrationId: string,
  ): Promise<AdminApplicationRegistrationClaimDTO[]> {
    const registration =
      await this.applicationRegistrationService.findOneByIdGlobal(
        applicationRegistrationId,
      );

    const claims: AdminApplicationRegistrationClaimDTO[] = [];

    if (isDefined(registration.ownerWorkspaceId)) {
      const ownerWorkspace = await this.workspaceRepository.findOne({
        where: { id: registration.ownerWorkspaceId },
      });

      claims.push({
        workspaceId: registration.ownerWorkspaceId,
        workspaceDisplayName: ownerWorkspace?.displayName ?? null,
        isOwner: true,
        expiresAt: null,
      });
    }

    const claimTokens = await this.appTokenRepository.find({
      where: {
        applicationRegistrationId,
        type: AppTokenType.ApplicationRegistrationClaimToken,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['workspace'],
      order: { createdAt: 'ASC' },
    });

    for (const claimToken of claimTokens) {
      if (!isDefined(claimToken.workspaceId)) {
        continue;
      }

      claims.push({
        workspaceId: claimToken.workspaceId,
        workspaceDisplayName: claimToken.workspace?.displayName ?? null,
        isOwner: false,
        expiresAt: claimToken.expiresAt,
      });
    }

    return claims;
  }

  private async deleteClaimTokens(
    applicationRegistrationId: string,
  ): Promise<void> {
    await this.appTokenRepository.delete({
      applicationRegistrationId,
      type: AppTokenType.ApplicationRegistrationClaimToken,
    });
  }

  // Returns the npm package name, or throws if the registration cannot be
  // claimed via a published-package challenge.
  private assertClaimable(registration: ApplicationRegistrationEntity): string {
    if (isDefined(registration.ownerWorkspaceId)) {
      throw new ApplicationRegistrationException(
        'Application registration is already owned by a workspace',
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_ALREADY_OWNED,
      );
    }

    if (
      registration.sourceType !== ApplicationRegistrationSourceType.NPM ||
      !isDefined(registration.sourcePackage)
    ) {
      throw new ApplicationRegistrationException(
        'Only npm-sourced applications can be claimed with a published code',
        ApplicationRegistrationExceptionCode.CLAIM_NOT_SUPPORTED,
      );
    }

    return registration.sourcePackage;
  }

  private async fetchPublishedClaimCode(
    packageName: string,
  ): Promise<PublishedClaimCodeLookup> {
    const registryUrl = this.twentyConfigService.get('APP_REGISTRY_URL');
    // Scoped packages need their slash percent-encoded for the registry path.
    const encodedName = packageName.startsWith('@')
      ? packageName.replace(/\//g, '%2F')
      : packageName;

    try {
      const { data } = await axios.get(`${registryUrl}/${encodedName}/latest`, {
        headers: { 'User-Agent': 'Twenty-Marketplace' },
        timeout: 10_000,
      });

      const parsed = registryPackageClaimSchema.safeParse(data);

      if (!parsed.success) {
        return { status: 'fetched', claimCode: null };
      }

      return {
        status: 'fetched',
        claimCode: parsed.data.twenty?.claimCode ?? null,
      };
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        isDefined(error.response) &&
        error.response.status === 404
      ) {
        // The package (or its latest dist-tag) does not exist: treat as a
        // missing claim code rather than a registry outage.
        return { status: 'fetched', claimCode: null };
      }

      this.logger.warn(
        `Failed to fetch claim code for package ${packageName}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return { status: 'unavailable' };
    }
  }
}
