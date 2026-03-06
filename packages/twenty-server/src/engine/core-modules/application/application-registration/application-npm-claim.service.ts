import { Injectable } from '@nestjs/common';

import { promises as fs } from 'fs';
import { join } from 'path';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import {
  type NpmClaimTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

const CLAIM_FILE_NAME = 'twenty-claim.jwt';

@Injectable()
export class ApplicationNpmClaimService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationPackageFetcherService: ApplicationPackageFetcherService,
  ) {}

  generateClaimToken(packageName: string, workspaceId: string): string {
    const secret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.NPM_CLAIM,
      workspaceId,
    );

    const payload: NpmClaimTokenJwtPayload = {
      sub: packageName,
      type: JwtTokenTypeEnum.NPM_CLAIM,
      workspaceId,
      packageName,
    };

    return this.jwtWrapperService.sign(payload, {
      secret,
      expiresIn: '10y',
    });
  }

  private verifyClaimToken(token: string): NpmClaimTokenJwtPayload {
    const decoded = this.jwtWrapperService.decode<NpmClaimTokenJwtPayload>(
      token,
      { json: true },
    );

    if (!isDefined(decoded) || decoded.type !== JwtTokenTypeEnum.NPM_CLAIM) {
      throw new ApplicationRegistrationException(
        'Invalid claim token: not an NPM_CLAIM token',
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    if (!isDefined(decoded.workspaceId)) {
      throw new ApplicationRegistrationException(
        'Invalid claim token: missing workspaceId',
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    const secret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.NPM_CLAIM,
      decoded.workspaceId,
    );

    return this.jwtWrapperService.verify<NpmClaimTokenJwtPayload>(token, {
      secret,
    });
  }

  async verifyAndClaimNpmPackage(
    packageName: string,
  ): Promise<ApplicationRegistrationEntity> {
    const resolvedPackage =
      await this.applicationPackageFetcherService.resolveNpmPackage(
        packageName,
      );

    try {
      const claimFilePath = join(resolvedPackage.extractedDir, CLAIM_FILE_NAME);

      let claimToken: string;

      try {
        claimToken = (await fs.readFile(claimFilePath, 'utf-8')).trim();
      } catch {
        throw new ApplicationRegistrationException(
          `No ${CLAIM_FILE_NAME} file found in npm package "${packageName}". Run \`twenty app:claim\` first.`,
          ApplicationRegistrationExceptionCode.INVALID_INPUT,
        );
      }

      const payload = this.verifyClaimToken(claimToken);

      if (payload.packageName !== packageName) {
        throw new ApplicationRegistrationException(
          `Claim token package name "${payload.packageName}" does not match requested package "${packageName}"`,
          ApplicationRegistrationExceptionCode.INVALID_INPUT,
        );
      }

      const manifest = resolvedPackage.manifest;
      const universalIdentifier = manifest.application.universalIdentifier;

      const existing =
        await this.applicationRegistrationService.findOneByUniversalIdentifier(
          universalIdentifier,
        );

      if (isDefined(existing)) {
        if (
          isDefined(existing.ownerWorkspaceId) &&
          existing.ownerWorkspaceId !== payload.workspaceId
        ) {
          throw new ApplicationRegistrationException(
            'This application is already claimed by another workspace',
            ApplicationRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED,
          );
        }

        return this.applicationRegistrationService.claimForNpm({
          existingRegistration: existing,
          packageName,
          ownerWorkspaceId: payload.workspaceId,
          manifest,
          version: resolvedPackage.packageJson.version as string | undefined,
        });
      }

      return this.applicationRegistrationService.createFromNpmClaim({
        packageName,
        universalIdentifier,
        name: manifest.application.displayName,
        description: manifest.application.description,
        author: manifest.application.author,
        logoUrl: manifest.application.logoUrl,
        websiteUrl: manifest.application.websiteUrl,
        termsUrl: manifest.application.termsUrl,
        version: resolvedPackage.packageJson.version as string | undefined,
        ownerWorkspaceId: payload.workspaceId,
      });
    } finally {
      await this.applicationPackageFetcherService.cleanupExtractedDir(
        resolvedPackage.cleanupDir,
      );
    }
  }
}
