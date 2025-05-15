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
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
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

  private getAppSecret(): string {
    return this.environmentConfigDriver.get('APP_SECRET');
  }

  private getConfigMetadata<T extends keyof ConfigVariables>(key: T) {
    return TypedReflect.getMetadata('config-variables', ConfigVariables)?.[
      key as string
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private logAndRethrow(message: string, error: any): never {
    this.logger.error(message, error);
    throw error;
  }

  private async convertAndSecureValue<T extends keyof ConfigVariables>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    key: T,
    isDecrypt = false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    try {
      const convertedValue = isDecrypt
        ? this.configValueConverter.convertDbValueToAppValue(value, key)
        : this.configValueConverter.convertAppValueToDbValue(value, key);

      const metadata = this.getConfigMetadata(key);
      const isSensitiveString =
        metadata?.isSensitive &&
        metadata.type === ConfigVariableType.STRING &&
        typeof convertedValue === 'string';

      if (!isSensitiveString) {
        return convertedValue;
      }

      const appSecret = this.getAppSecret();

      try {
        return isDecrypt
          ? decryptText(convertedValue, appSecret)
          : encryptText(convertedValue, appSecret);
      } catch (error) {
        this.logger.error(
          `Failed to ${isDecrypt ? 'decrypt' : 'encrypt'} value for key ${
            key as string
          }`,
          error,
        );

        return convertedValue;
      }
    } catch (error) {
      this.logAndRethrow(
        `Failed to convert value ${
          isDecrypt ? 'from DB' : 'to DB'
        } for key ${key as string}`,
        error,
      );
    }
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

      this.logger.debug(
        `Fetching config for ${key as string} in database: ${result?.value}`,
      );

      return await this.convertAndSecureValue(result.value, key, true);
    } catch (error) {
      this.logAndRethrow(`Failed to get config for ${key as string}`, error);
    }
  }

  async set<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T],
  ): Promise<void> {
    try {
      const dbValue = await this.convertAndSecureValue(value, key, false);

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
      this.logAndRethrow(`Failed to set config for ${key as string}`, error);
    }
  }

  async delete<T extends keyof ConfigVariables>(key: T): Promise<void> {
    try {
      await this.keyValuePairRepository.delete(
        this.getConfigVariableWhereClause(key as string),
      );
    } catch (error) {
      this.logAndRethrow(`Failed to delete config for ${key as string}`, error);
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

      for (const configVar of configVars) {
        if (configVar.value !== null) {
          const key = configVar.key as keyof ConfigVariables;

          try {
            const value = await this.convertAndSecureValue(
              configVar.value,
              key,
              true,
            );

            if (value !== undefined) {
              result.set(key, value);
            }
          } catch (error) {
            this.logger.error(
              `Failed to process config value for key ${key as string}`,
              error,
            );
            continue;
          }
        }
      }

      return result;
    } catch (error) {
      this.logAndRethrow('Failed to load all config variables', error);
    }
  }
}
