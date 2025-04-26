import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsWhere, IsNull, Repository } from 'typeorm';

import {
  decryptText,
  encryptText,
} from 'src/engine/core-modules/auth/auth.util';
import {
  KeyValuePair,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigValueConverterService } from 'src/engine/core-modules/twenty-config/conversion/config-value-converter.service';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { TypedReflect } from 'src/utils/typed-reflect';

import { ConfigStorageInterface } from './interfaces/config-storage.interface';

@Injectable()
export class ConfigStorageService implements ConfigStorageInterface {
  private readonly logger = new Logger(ConfigStorageService.name);

  constructor(
    @InjectRepository(KeyValuePair, 'core')
    private readonly keyValuePairRepository: Repository<KeyValuePair>,
    private readonly configValueConverter: ConfigValueConverterService,
    private readonly environmentConfigDriver: EnvironmentConfigDriver,
  ) {}

  private getConfigVariableWhereClause(
    key?: string,
  ): FindOptionsWhere<KeyValuePair> {
    return {
      type: KeyValuePairType.CONFIG_VARIABLE,
      ...(key ? { key } : {}),
      userId: IsNull(),
      workspaceId: IsNull(),
    };
  }

  async get<T extends keyof ConfigVariables>(
    key: T,
  ): Promise<ConfigVariables[T] | undefined> {
    try {
      const result = await this.keyValuePairRepository.findOne({
        where: this.getConfigVariableWhereClause(key as string),
      });

      if (result === null) {
        return undefined;
      }

      const appSecret = this.environmentConfigDriver.get('APP_SECRET');
      const metadata = TypedReflect.getMetadata(
        'config-variables',
        ConfigVariables,
      )?.[key as string];

      try {
        this.logger.debug(
          `Fetching config for ${key as string} in database: ${result?.value}`,
        );

        // First convert DB value to app value type
        const value = this.configValueConverter.convertDbValueToAppValue(
          result.value,
          key,
        );

        // Then decrypt if sensitive and is a string
        if (
          metadata?.isSensitive &&
          metadata.type === 'string' &&
          typeof value === 'string'
        ) {
          try {
            return decryptText(value, appSecret) as ConfigVariables[T];
          } catch (error) {
            this.logger.error(
              `Failed to decrypt value for key ${key as string}`,
              error,
            );
            // Fall back to the original value if decryption fails
          }
        }

        return value;
      } catch (error) {
        this.logger.error(
          `Failed to convert value to app type for key ${key as string}`,
          error,
        );
        throw error;
      }
    } catch (error) {
      this.logger.error(`Failed to get config for ${key as string}`, error);
      throw error;
    }
  }

  async set<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void> {
    try {
      const appSecret = this.environmentConfigDriver.get('APP_SECRET');
      const metadata = TypedReflect.getMetadata(
        'config-variables',
        ConfigVariables,
      )?.[key as string];

      // First convert to DB storage format
      let dbValue;

      try {
        dbValue = this.configValueConverter.convertAppValueToDbValue(value);
      } catch (error) {
        this.logger.error(
          `Failed to convert value to storage type for key ${key as string}`,
          error,
        );
        throw error;
      }

      // Then encrypt if sensitive and is string
      if (
        metadata?.isSensitive &&
        metadata.type === 'string' &&
        typeof dbValue === 'string'
      ) {
        try {
          dbValue = encryptText(dbValue, appSecret);
        } catch (error) {
          this.logger.error(
            `Failed to encrypt value for key ${key as string}`,
            error,
          );
          // Keep the original value if encryption fails
        }
      }

      const existingRecord = await this.keyValuePairRepository.findOne({
        where: this.getConfigVariableWhereClause(key as string),
      });

      if (existingRecord) {
        await this.keyValuePairRepository.update(
          { id: existingRecord.id },
          { value: dbValue },
        );
      } else {
        await this.keyValuePairRepository.insert({
          key: key as string,
          value: dbValue,
          userId: null,
          workspaceId: null,
          type: KeyValuePairType.CONFIG_VARIABLE,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to set config for ${key as string}`, error);
      throw error;
    }
  }

  async delete<T extends keyof ConfigVariables>(key: T): Promise<void> {
    try {
      await this.keyValuePairRepository.delete(
        this.getConfigVariableWhereClause(key as string),
      );
    } catch (error) {
      this.logger.error(`Failed to delete config for ${key as string}`, error);
      throw error;
    }
  }

  async loadAll(): Promise<
    Map<keyof ConfigVariables, ConfigVariables[keyof ConfigVariables]>
  > {
    try {
      const configVars = await this.keyValuePairRepository.find({
        where: this.getConfigVariableWhereClause(),
      });

      const result = new Map<
        keyof ConfigVariables,
        ConfigVariables[keyof ConfigVariables]
      >();

      const appSecret = this.environmentConfigDriver.get('APP_SECRET');

      for (const configVar of configVars) {
        if (configVar.value !== null) {
          const key = configVar.key as keyof ConfigVariables;

          try {
            const metadata = TypedReflect.getMetadata(
              'config-variables',
              ConfigVariables,
            )?.[key as string];

            let value = this.configValueConverter.convertDbValueToAppValue(
              configVar.value,
              key,
            );

            if (metadata?.isSensitive && metadata.type === 'string') {
              value = decryptText(
                value as string,
                appSecret,
              ) as ConfigVariables[keyof ConfigVariables];
            }

            if (value !== undefined) {
              result.set(key, value);
            }
          } catch (error) {
            this.logger.error(
              `Failed to convert value to app type for key ${key as string}`,
              error,
            );
            continue;
          }
        }
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to load all config variables', error);
      throw error;
    }
  }
}
