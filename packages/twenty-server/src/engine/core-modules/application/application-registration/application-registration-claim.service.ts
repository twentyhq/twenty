import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import axios from 'axios';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';
import { z } from 'zod';

import { ApplicationRegistrationClaimEntity } from 'src/engine/core-modules/application/application-registration/application-registration-claim.entity';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { type ApplicationRegistrationClaimChallengeDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-claim-challenge.dto';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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

@Injectable()
export class ApplicationRegistrationClaimService {
  private readonly logger = new Logger(
    ApplicationRegistrationClaimService.name,
  );

  constructor(
    @InjectRepository(ApplicationRegistrationClaimEntity)
    private readonly claimRepository: Repository<ApplicationRegistrationClaimEntity>,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
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

    const existing = await this.claimRepository.findOne({
      where: {
        applicationRegistrationId: registration.id,
        workspaceId: params.workspaceId,
      },
    });

    if (isDefined(existing)) {
      await this.claimRepository.update(existing.id, {
        token,
        expiresAt,
        createdByUserId: params.userId,
      });
    } else {
      await this.claimRepository.save(
        this.claimRepository.create({
          applicationRegistrationId: registration.id,
          workspaceId: params.workspaceId,
          createdByUserId: params.userId,
          token,
          expiresAt,
        }),
      );
    }

    return {
      applicationRegistrationId: registration.id,
      sourcePackage,
      token,
      expiresAt,
    };
  }

  async verifyClaim(params: {
    applicationRegistrationId: string;
    workspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const registration =
      await this.applicationRegistrationService.findOneByIdGlobal(
        params.applicationRegistrationId,
      );

    const sourcePackage = this.assertClaimable(registration);

    const claim = await this.claimRepository.findOne({
      where: {
        applicationRegistrationId: registration.id,
        workspaceId: params.workspaceId,
      },
    });

    if (!isDefined(claim)) {
      throw new ApplicationRegistrationException(
        'No claim in progress for this workspace',
        ApplicationRegistrationExceptionCode.CLAIM_NOT_STARTED,
      );
    }

    if (claim.expiresAt.getTime() < Date.now()) {
      await this.claimRepository.delete(claim.id);

      throw new ApplicationRegistrationException(
        'Claim has expired',
        ApplicationRegistrationExceptionCode.CLAIM_EXPIRED,
      );
    }

    const publishedClaimCode =
      await this.fetchPublishedClaimCode(sourcePackage);

    if (!isDefined(publishedClaimCode)) {
      throw new ApplicationRegistrationException(
        `No claim code found in published package ${sourcePackage}`,
        ApplicationRegistrationExceptionCode.CLAIM_CODE_NOT_FOUND,
      );
    }

    if (publishedClaimCode !== claim.token) {
      throw new ApplicationRegistrationException(
        `Claim code mismatch for package ${sourcePackage}`,
        ApplicationRegistrationExceptionCode.CLAIM_CODE_MISMATCH,
      );
    }

    const claimed = await this.applicationRegistrationService.claimOwnership({
      applicationRegistrationId: registration.id,
      claimingWorkspaceId: params.workspaceId,
    });

    // Ownership is settled; drop any pending challenges (including losers of a
    // concurrent race from other workspaces).
    await this.claimRepository.delete({
      applicationRegistrationId: registration.id,
    });

    return claimed;
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
  ): Promise<string | null> {
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
        return null;
      }

      return parsed.data.twenty?.claimCode ?? null;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch claim code for package ${packageName}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return null;
    }
  }
}
