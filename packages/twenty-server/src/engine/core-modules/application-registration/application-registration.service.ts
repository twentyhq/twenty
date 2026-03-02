import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import * as bcrypt from 'bcrypt';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application-registration/application-registration.exception';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application-registration/constants/oauth-scopes';
import { type ApplicationRegistrationStatsDTO } from 'src/engine/core-modules/application-registration/dtos/application-registration-stats.dto';
import { type CreateApplicationRegistrationInput } from 'src/engine/core-modules/application-registration/dtos/create-application-registration.input';
import { type PublicApplicationRegistrationDTO } from 'src/engine/core-modules/application-registration/dtos/public-application-registration.dto';
import { type UpdateApplicationRegistrationInput } from 'src/engine/core-modules/application-registration/dtos/update-application-registration.input';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { validateRedirectUri } from 'src/engine/core-modules/auth/utils/validate-redirect-uri.util';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class ApplicationRegistrationService {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  async findMany(
    workspaceId: string,
  ): Promise<ApplicationRegistrationEntity[]> {
    return this.applicationRegistrationRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneById(
    id: string,
    workspaceId: string,
  ): Promise<ApplicationRegistrationEntity> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: { id, workspaceId },
    });

    if (!registration) {
      throw new ApplicationRegistrationException(
        `Application registration with id ${id} not found`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    return registration;
  }

  // Global lookup — used by OAuth flow (no workspace scoping)
  async findOneByClientId(
    clientId: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    return this.applicationRegistrationRepository.findOne({
      where: { oAuthClientId: clientId },
    });
  }

  // Global lookup — used by OAuth authorize page (no workspace scoping)
  async findPublicByClientId(
    clientId: string,
  ): Promise<PublicApplicationRegistrationDTO | null> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: { oAuthClientId: clientId },
      select: ['id', 'name', 'logoUrl', 'websiteUrl', 'oAuthScopes'],
    });

    if (!registration) {
      return null;
    }

    return {
      id: registration.id,
      name: registration.name,
      logoUrl: registration.logoUrl,
      websiteUrl: registration.websiteUrl,
      oAuthScopes: registration.oAuthScopes,
    };
  }

  async isOwnedByWorkspace(id: string, workspaceId: string): Promise<boolean> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: { id },
      select: ['id', 'workspaceId'],
    });

    return registration?.workspaceId === workspaceId;
  }

  // Global lookup — used by app sync to find existing registrations
  async findOneByUniversalIdentifier(
    universalIdentifier: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    return this.applicationRegistrationRepository.findOne({
      where: { universalIdentifier },
    });
  }

  async create(
    input: CreateApplicationRegistrationInput,
    workspaceId: string,
    createdByUserId: string | null,
  ): Promise<{
    applicationRegistration: ApplicationRegistrationEntity;
    clientSecret: string;
  }> {
    const universalIdentifier = input.universalIdentifier ?? v4();

    const existingByUid =
      await this.findOneByUniversalIdentifier(universalIdentifier);

    if (existingByUid) {
      throw new ApplicationRegistrationException(
        `Universal identifier ${universalIdentifier} is already claimed`,
        ApplicationRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED,
      );
    }

    if (isDefined(input.oAuthRedirectUris)) {
      this.validateRedirectUris(input.oAuthRedirectUris);
    }

    if (isDefined(input.oAuthScopes)) {
      this.validateScopes(input.oAuthScopes);
    }

    const clientId = v4();
    const { clientSecret, clientSecretHash } =
      await this.generateClientSecret();

    const applicationRegistration =
      this.applicationRegistrationRepository.create({
        universalIdentifier,
        name: input.name,
        description: input.description ?? null,
        logoUrl: input.logoUrl ?? null,
        author: input.author ?? null,
        oAuthClientId: clientId,
        oAuthClientSecretHash: clientSecretHash,
        oAuthRedirectUris: input.oAuthRedirectUris ?? [],
        oAuthScopes: input.oAuthScopes ?? [],
        createdByUserId,
        workspaceId,
        websiteUrl: input.websiteUrl ?? null,
        termsUrl: input.termsUrl ?? null,
      });

    const saved = await this.applicationRegistrationRepository.save(
      applicationRegistration,
    );

    return { applicationRegistration: saved, clientSecret };
  }

  async update(
    input: UpdateApplicationRegistrationInput,
    workspaceId: string,
  ): Promise<ApplicationRegistrationEntity> {
    const { id, update } = input;

    await this.findOneById(id, workspaceId);

    if (isDefined(update.oAuthRedirectUris)) {
      this.validateRedirectUris(update.oAuthRedirectUris);
    }

    if (isDefined(update.oAuthScopes)) {
      this.validateScopes(update.oAuthScopes);
    }

    const updateData: Record<string, unknown> = {};

    if (isDefined(update.name)) updateData.name = update.name;
    if (isDefined(update.description))
      updateData.description = update.description;
    if (isDefined(update.logoUrl)) updateData.logoUrl = update.logoUrl;
    if (isDefined(update.author)) updateData.author = update.author;
    if (isDefined(update.oAuthRedirectUris))
      updateData.oAuthRedirectUris = update.oAuthRedirectUris;
    if (isDefined(update.oAuthScopes))
      updateData.oAuthScopes = update.oAuthScopes;
    if (isDefined(update.websiteUrl)) updateData.websiteUrl = update.websiteUrl;
    if (isDefined(update.termsUrl)) updateData.termsUrl = update.termsUrl;

    if (Object.keys(updateData).length > 0) {
      await this.applicationRegistrationRepository.update(id, updateData);
    }

    return this.findOneById(id, workspaceId);
  }

  async delete(id: string, workspaceId: string): Promise<boolean> {
    await this.findOneById(id, workspaceId);
    await this.applicationRegistrationRepository.softDelete(id);

    return true;
  }

  async rotateClientSecret(id: string, workspaceId: string): Promise<string> {
    await this.findOneById(id, workspaceId);

    const { clientSecret, clientSecretHash } =
      await this.generateClientSecret();

    await this.applicationRegistrationRepository.update(id, {
      oAuthClientSecretHash: clientSecretHash,
    });

    return clientSecret;
  }

  async verifyClientSecret(
    registration: ApplicationRegistrationEntity,
    clientSecret: string,
  ): Promise<boolean> {
    if (!registration.oAuthClientSecretHash) {
      return false;
    }

    return bcrypt.compare(clientSecret, registration.oAuthClientSecretHash);
  }

  async getStats(
    applicationRegistrationId: string,
    workspaceId: string,
  ): Promise<ApplicationRegistrationStatsDTO> {
    await this.findOneById(applicationRegistrationId, workspaceId);

    const versionDistribution: { version: string; count: number }[] =
      await this.applicationRepository
        .createQueryBuilder('application')
        .select("COALESCE(application.version, 'unknown')", 'version')
        .addSelect('COUNT(*)::int', 'count')
        .where(
          'application."applicationRegistrationId" = :applicationRegistrationId',
          { applicationRegistrationId },
        )
        .andWhere('application."deletedAt" IS NULL')
        .groupBy('version')
        .orderBy('count', 'DESC')
        .getRawMany();

    const activeInstalls = versionDistribution.reduce(
      (sum, entry) => sum + entry.count,
      0,
    );

    const mostInstalledVersion = versionDistribution[0]?.version ?? null;

    return {
      activeInstalls,
      mostInstalledVersion,
      versionDistribution,
    };
  }

  private async generateClientSecret(): Promise<{
    clientSecret: string;
    clientSecretHash: string;
  }> {
    const clientSecret = crypto.randomBytes(32).toString('hex');
    const clientSecretHash = await bcrypt.hash(
      clientSecret,
      BCRYPT_SALT_ROUNDS,
    );

    return { clientSecret, clientSecretHash };
  }

  private validateRedirectUris(uris: string[]): void {
    for (const uri of uris) {
      const result = validateRedirectUri(uri);

      if (!result.valid) {
        throw new ApplicationRegistrationException(
          result.reason,
          ApplicationRegistrationExceptionCode.INVALID_REDIRECT_URI,
        );
      }
    }
  }

  private validateScopes(scopes: string[]): void {
    const validScopes: readonly string[] = ALL_OAUTH_SCOPES;
    const invalidScopes = scopes.filter(
      (scope) => !validScopes.includes(scope),
    );

    if (invalidScopes.length > 0) {
      throw new ApplicationRegistrationException(
        `Invalid scopes: ${invalidScopes.join(', ')}`,
        ApplicationRegistrationExceptionCode.INVALID_SCOPE,
      );
    }
  }
}
