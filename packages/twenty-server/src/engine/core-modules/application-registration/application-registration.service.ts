import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import * as bcrypt from 'bcrypt';
import { type ServerVariables } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { In, Not, type Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v4 } from 'uuid';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application-registration/application-registration-variable.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application-registration/application-registration.exception';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application-registration/constants/oauth-scopes';
import { type ApplicationRegistrationStatsOutput } from 'src/engine/core-modules/application-registration/dtos/application-registration-stats.output';
import { type CreateApplicationRegistrationInput } from 'src/engine/core-modules/application-registration/dtos/create-application-registration.input';
import { type CreateApplicationRegistrationVariableInput } from 'src/engine/core-modules/application-registration/dtos/create-application-registration-variable.input';
import { type UpdateApplicationRegistrationInput } from 'src/engine/core-modules/application-registration/dtos/update-application-registration.input';
import { type UpdateApplicationRegistrationVariableInput } from 'src/engine/core-modules/application-registration/dtos/update-application-registration-variable.input';
import { ApplicationRegistrationEncryptionService } from 'src/engine/core-modules/application-registration/application-registration-encryption.service';
import { validateRedirectUri } from 'src/engine/core-modules/auth/utils/validate-redirect-uri.util';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class ApplicationRegistrationService {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationRegistrationVariableEntity)
    private readonly variableRepository: Repository<ApplicationRegistrationVariableEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly encryptionService: ApplicationRegistrationEncryptionService,
  ) {}

  async findMany(): Promise<ApplicationRegistrationEntity[]> {
    return this.applicationRegistrationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOneById(id: string): Promise<ApplicationRegistrationEntity> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: { id },
    });

    if (!registration) {
      throw new ApplicationRegistrationException(
        `Application registration with id ${id} not found`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    return registration;
  }

  async findOneByClientId(
    clientId: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    return this.applicationRegistrationRepository.findOne({
      where: { oAuthClientId: clientId },
    });
  }

  async findOneByUniversalIdentifier(
    universalIdentifier: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    return this.applicationRegistrationRepository.findOne({
      where: { universalIdentifier },
    });
  }

  async create(
    input: CreateApplicationRegistrationInput,
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
  ): Promise<ApplicationRegistrationEntity> {
    await this.findOneById(input.id);

    if (isDefined(input.oAuthRedirectUris)) {
      this.validateRedirectUris(input.oAuthRedirectUris);
    }

    if (isDefined(input.oAuthScopes)) {
      this.validateScopes(input.oAuthScopes);
    }

    const updateData: QueryDeepPartialEntity<ApplicationRegistrationEntity> =
      {};

    if (isDefined(input.name)) updateData.name = input.name;
    if (isDefined(input.description))
      updateData.description = input.description;
    if (isDefined(input.logoUrl)) updateData.logoUrl = input.logoUrl;
    if (isDefined(input.author)) updateData.author = input.author;
    if (isDefined(input.oAuthRedirectUris))
      updateData.oAuthRedirectUris = input.oAuthRedirectUris;
    if (isDefined(input.oAuthScopes))
      updateData.oAuthScopes = input.oAuthScopes;
    if (isDefined(input.websiteUrl)) updateData.websiteUrl = input.websiteUrl;
    if (isDefined(input.termsUrl)) updateData.termsUrl = input.termsUrl;

    await this.applicationRegistrationRepository.update(input.id, updateData);

    return this.findOneById(input.id);
  }

  async delete(id: string): Promise<boolean> {
    await this.findOneById(id);
    await this.applicationRegistrationRepository.softDelete(id);

    return true;
  }

  async rotateClientSecret(id: string): Promise<string> {
    await this.findOneById(id);

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

  // Variable operations

  async findVariables(
    applicationRegistrationId: string,
  ): Promise<ApplicationRegistrationVariableEntity[]> {
    return this.variableRepository.find({
      where: { applicationRegistrationId },
      order: { key: 'ASC' },
    });
  }

  async createVariable(
    input: CreateApplicationRegistrationVariableInput,
  ): Promise<ApplicationRegistrationVariableEntity> {
    await this.findOneById(input.applicationRegistrationId);

    const encryptedValue = this.encryptionService.encrypt(input.value);

    const variable = this.variableRepository.create({
      applicationRegistrationId: input.applicationRegistrationId,
      key: input.key,
      encryptedValue,
      description: input.description ?? '',
      isSecret: input.isSecret ?? true,
    });

    return this.variableRepository.save(variable);
  }

  async updateVariable(
    input: UpdateApplicationRegistrationVariableInput,
  ): Promise<ApplicationRegistrationVariableEntity> {
    const variable = await this.variableRepository.findOne({
      where: { id: input.id },
    });

    if (!variable) {
      throw new ApplicationRegistrationException(
        `Variable with id ${input.id} not found`,
        ApplicationRegistrationExceptionCode.VARIABLE_NOT_FOUND,
      );
    }

    const updateData: QueryDeepPartialEntity<ApplicationRegistrationVariableEntity> =
      {};

    if (isDefined(input.value)) {
      updateData.encryptedValue = this.encryptionService.encrypt(input.value);
    }
    if (isDefined(input.description)) {
      updateData.description = input.description;
    }

    await this.variableRepository.update(input.id, updateData);

    return this.variableRepository.findOneOrFail({ where: { id: input.id } });
  }

  async deleteVariable(id: string): Promise<boolean> {
    const variable = await this.variableRepository.findOne({
      where: { id },
    });

    if (!variable) {
      throw new ApplicationRegistrationException(
        `Variable with id ${id} not found`,
        ApplicationRegistrationExceptionCode.VARIABLE_NOT_FOUND,
      );
    }

    await this.variableRepository.delete(id);

    return true;
  }

  // Syncs variable schemas from manifest: creates missing, updates metadata, removes stale
  async syncVariableSchemas(
    applicationRegistrationId: string,
    serverVariables: ServerVariables,
  ): Promise<void> {
    const declaredKeys = Object.keys(serverVariables);

    const existingVariables = await this.variableRepository.find({
      where: { applicationRegistrationId },
    });

    const existingByKey = new Map(
      existingVariables.map((variable) => [variable.key, variable]),
    );

    for (const [key, schema] of Object.entries(serverVariables)) {
      const existing = existingByKey.get(key);

      if (existing) {
        await this.variableRepository.update(existing.id, {
          description: schema.description ?? '',
          isSecret: schema.isSecret ?? true,
          isRequired: schema.isRequired ?? false,
        });
      } else {
        await this.variableRepository.save(
          this.variableRepository.create({
            applicationRegistrationId,
            key,
            encryptedValue: '',
            description: schema.description ?? '',
            isSecret: schema.isSecret ?? true,
            isRequired: schema.isRequired ?? false,
          }),
        );
      }
    }

    if (declaredKeys.length > 0) {
      await this.variableRepository.delete({
        applicationRegistrationId,
        key: Not(In(declaredKeys)),
      });
    } else {
      await this.variableRepository.delete({ applicationRegistrationId });
    }
  }

  async getStats(
    applicationRegistrationId: string,
  ): Promise<ApplicationRegistrationStatsOutput> {
    await this.findOneById(applicationRegistrationId);

    const installs = await this.applicationRepository.find({
      where: { applicationRegistrationId },
      select: ['version'],
    });

    const versionCounts = new Map<string, number>();

    for (const install of installs) {
      const version = install.version ?? 'unknown';

      versionCounts.set(version, (versionCounts.get(version) ?? 0) + 1);
    }

    const versionDistribution = Array.from(versionCounts.entries())
      .map(([version, count]) => ({ version, count }))
      .sort((a, b) => b.count - a.count);

    const mostInstalledVersion = versionDistribution[0]?.version ?? null;

    return {
      activeInstalls: installs.length,
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
