import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import crypto from 'crypto';
import { type ServerVariables } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { In, Not, type Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v4 } from 'uuid';

import { AppRegistrationVariableEntity } from 'src/engine/core-modules/app-registration/app-registration-variable.entity';
import { AppRegistrationEntity } from 'src/engine/core-modules/app-registration/app-registration.entity';
import {
  AppRegistrationException,
  AppRegistrationExceptionCode,
} from 'src/engine/core-modules/app-registration/app-registration.exception';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/app-registration/constants/oauth-scopes';
import { type AppRegistrationStatsOutput } from 'src/engine/core-modules/app-registration/dtos/app-registration-stats.output';
import { type CreateAppRegistrationInput } from 'src/engine/core-modules/app-registration/dtos/create-app-registration.input';
import { type CreateAppRegistrationVariableInput } from 'src/engine/core-modules/app-registration/dtos/create-app-registration-variable.input';
import { type UpdateAppRegistrationInput } from 'src/engine/core-modules/app-registration/dtos/update-app-registration.input';
import { type UpdateAppRegistrationVariableInput } from 'src/engine/core-modules/app-registration/dtos/update-app-registration-variable.input';
import { AppRegistrationEncryptionService } from 'src/engine/core-modules/app-registration/app-registration-encryption.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AppRegistrationService {
  constructor(
    @InjectRepository(AppRegistrationEntity)
    private readonly appRegistrationRepository: Repository<AppRegistrationEntity>,
    @InjectRepository(AppRegistrationVariableEntity)
    private readonly variableRepository: Repository<AppRegistrationVariableEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly encryptionService: AppRegistrationEncryptionService,
  ) {}

  async findMany(): Promise<AppRegistrationEntity[]> {
    return this.appRegistrationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOneById(id: string): Promise<AppRegistrationEntity> {
    const registration = await this.appRegistrationRepository.findOne({
      where: { id },
    });

    if (!registration) {
      throw new AppRegistrationException(
        `App registration with id ${id} not found`,
        AppRegistrationExceptionCode.APP_REGISTRATION_NOT_FOUND,
      );
    }

    return registration;
  }

  async findOneByClientId(
    clientId: string,
  ): Promise<AppRegistrationEntity | null> {
    return this.appRegistrationRepository.findOne({
      where: { clientId },
    });
  }

  async findOneByUniversalIdentifier(
    universalIdentifier: string,
  ): Promise<AppRegistrationEntity | null> {
    return this.appRegistrationRepository.findOne({
      where: { universalIdentifier },
    });
  }

  async create(
    input: CreateAppRegistrationInput,
    createdByUserId: string | null,
  ): Promise<{ appRegistration: AppRegistrationEntity; clientSecret: string }> {
    const universalIdentifier = input.universalIdentifier ?? v4();

    const existingByUid =
      await this.findOneByUniversalIdentifier(universalIdentifier);

    if (existingByUid) {
      throw new AppRegistrationException(
        `Universal identifier ${universalIdentifier} is already claimed`,
        AppRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED,
      );
    }

    if (isDefined(input.scopes)) {
      this.validateScopes(input.scopes);
    }

    const clientId = v4();
    const { clientSecret, clientSecretHash } =
      await this.generateClientSecret();

    const appRegistration = this.appRegistrationRepository.create({
      universalIdentifier,
      name: input.name,
      description: input.description ?? null,
      logoUrl: input.logoUrl ?? null,
      author: input.author ?? null,
      clientId,
      clientSecretHash,
      redirectUris: input.redirectUris ?? [],
      scopes: input.scopes ?? [],
      createdByUserId,
      websiteUrl: input.websiteUrl ?? null,
      termsUrl: input.termsUrl ?? null,
    });

    const saved = await this.appRegistrationRepository.save(appRegistration);

    return { appRegistration: saved, clientSecret };
  }

  async update(
    input: UpdateAppRegistrationInput,
  ): Promise<AppRegistrationEntity> {
    await this.findOneById(input.id);

    if (isDefined(input.scopes)) {
      this.validateScopes(input.scopes);
    }

    const updateData: QueryDeepPartialEntity<AppRegistrationEntity> = {};

    if (isDefined(input.name)) updateData.name = input.name;
    if (isDefined(input.description)) updateData.description = input.description;
    if (isDefined(input.logoUrl)) updateData.logoUrl = input.logoUrl;
    if (isDefined(input.author)) updateData.author = input.author;
    if (isDefined(input.redirectUris)) updateData.redirectUris = input.redirectUris;
    if (isDefined(input.scopes)) updateData.scopes = input.scopes;
    if (isDefined(input.websiteUrl)) updateData.websiteUrl = input.websiteUrl;
    if (isDefined(input.termsUrl)) updateData.termsUrl = input.termsUrl;

    await this.appRegistrationRepository.update(input.id, updateData);

    return this.findOneById(input.id);
  }

  async delete(id: string): Promise<boolean> {
    await this.findOneById(id);
    await this.appRegistrationRepository.softDelete(id);

    return true;
  }

  async rotateClientSecret(id: string): Promise<string> {
    await this.findOneById(id);

    const { clientSecret, clientSecretHash } =
      await this.generateClientSecret();

    await this.appRegistrationRepository.update(id, { clientSecretHash });

    return clientSecret;
  }

  async verifyClientSecret(
    registration: AppRegistrationEntity,
    clientSecret: string,
  ): Promise<boolean> {
    if (!registration.clientSecretHash) {
      return false;
    }

    return bcrypt.compare(clientSecret, registration.clientSecretHash);
  }

  // Variable operations

  async findVariables(
    appRegistrationId: string,
  ): Promise<AppRegistrationVariableEntity[]> {
    return this.variableRepository.find({
      where: { appRegistrationId },
      order: { key: 'ASC' },
    });
  }

  async createVariable(
    input: CreateAppRegistrationVariableInput,
  ): Promise<AppRegistrationVariableEntity> {
    await this.findOneById(input.appRegistrationId);

    const encryptedValue = this.encryptionService.encrypt(input.value);

    const variable = this.variableRepository.create({
      appRegistrationId: input.appRegistrationId,
      key: input.key,
      encryptedValue,
      description: input.description ?? '',
      isSecret: input.isSecret ?? true,
    });

    return this.variableRepository.save(variable);
  }

  async updateVariable(
    input: UpdateAppRegistrationVariableInput,
  ): Promise<AppRegistrationVariableEntity> {
    const variable = await this.variableRepository.findOne({
      where: { id: input.id },
    });

    if (!variable) {
      throw new AppRegistrationException(
        `Variable with id ${input.id} not found`,
        AppRegistrationExceptionCode.VARIABLE_NOT_FOUND,
      );
    }

    const updateData: QueryDeepPartialEntity<AppRegistrationVariableEntity> = {};

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
      throw new AppRegistrationException(
        `Variable with id ${id} not found`,
        AppRegistrationExceptionCode.VARIABLE_NOT_FOUND,
      );
    }

    await this.variableRepository.delete(id);

    return true;
  }

  // Syncs variable schemas from manifest: creates missing, updates metadata, removes stale
  async syncVariableSchemas(
    appRegistrationId: string,
    serverVariables: ServerVariables,
  ): Promise<void> {
    const declaredKeys = Object.keys(serverVariables);

    for (const [key, schema] of Object.entries(serverVariables)) {
      const existing = await this.variableRepository.findOne({
        where: { appRegistrationId, key },
      });

      if (existing) {
        await this.variableRepository.update(existing.id, {
          description: schema.description ?? '',
          isSecret: schema.isSecret ?? true,
          isRequired: schema.isRequired ?? false,
        });
      } else {
        await this.variableRepository.save(
          this.variableRepository.create({
            appRegistrationId,
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
        appRegistrationId,
        key: Not(In(declaredKeys)),
      });
    } else {
      await this.variableRepository.delete({ appRegistrationId });
    }
  }

  async getStats(
    appRegistrationId: string,
  ): Promise<AppRegistrationStatsOutput> {
    await this.findOneById(appRegistrationId);

    const installs = await this.applicationRepository.find({
      where: { appRegistrationId },
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

    const latestVersion = versionDistribution[0]?.version ?? null;

    return {
      activeInstalls: installs.length,
      latestVersion,
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

  private validateScopes(scopes: string[]): void {
    const validScopes: readonly string[] = ALL_OAUTH_SCOPES;
    const invalidScopes = scopes.filter(
      (scope) => !validScopes.includes(scope),
    );

    if (invalidScopes.length > 0) {
      throw new AppRegistrationException(
        `Invalid scopes: ${invalidScopes.join(', ')}`,
        AppRegistrationExceptionCode.INVALID_SCOPE,
      );
    }
  }
}
