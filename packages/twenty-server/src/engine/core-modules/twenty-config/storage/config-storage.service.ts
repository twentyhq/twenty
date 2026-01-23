import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type FindOptionsWhere, IsNull, Repository } from 'typeorm';

import {
  KeyValuePairEntity,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigValueConverterService } from 'src/engine/core-modules/twenty-config/conversion/config-value-converter.service';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import {
  ConfigVariableException,
  ConfigVariableExceptionCode,
} from 'src/engine/core-modules/twenty-config/twenty-config.exception';
import { TypedReflect } from 'src/utils/typed-reflect';

import { type ConfigStorageInterface } from './interfaces/config-storage.interface';

@Injectable()
export class ConfigStorageService implements ConfigStorageInterface {
  private readonly logger = new Logger(ConfigStorageService.name);

  constructor(
    @InjectRepository(KeyValuePairEntity)
    private readonly keyValuePairRepository: Repository<KeyValuePairEntity>,
    private readonly configValueConverter: ConfigValueConverterService,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  private getConfigVariableWhereClause(
    key?: string,
  ): FindOptionsWhere<KeyValuePairEntity> {
    return {
      type: KeyValuePairType.CONFIG_VARIABLE,
      ...(key ? { key } : {}),
      userId: IsNull(),
      workspaceId: IsNull(),
    };
  }

  private getConfigMetadata<T extends keyof ConfigVariables>(key: T) {
    return TypedReflect.getMetadata('config-variables', ConfigVariables)?.[
      key as string
    ];
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

      return isDecrypt
        ? this.secretEncryptionService.decrypt(convertedValue)
        : this.secretEncryptionService.encrypt(convertedValue);
    } catch (error) {
      throw new ConfigVariableException(
        `Failed to convert value for key ${key as string}: ${error.message}`,
        ConfigVariableExceptionCode.VALIDATION_FAILED,
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
      if (error instanceof ConfigVariableException) {
        throw error;
      }

      throw new ConfigVariableException(
        `Failed to retrieve config variable ${key as string}: ${error instanceof Error ? error.message : String(error)}`,
        ConfigVariableExceptionCode.INTERNAL_ERROR,
      );
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
      if (error instanceof ConfigVariableException) {
        throw error;
      }

      throw new ConfigVariableException(
        `Failed to save config variable ${key as string}: ${error instanceof Error ? error.message : String(error)}`,
        ConfigVariableExceptionCode.INTERNAL_ERROR,
      );
    }
  }

  async delete<T extends keyof ConfigVariables>(key: T): Promise<void> {
    try {
      await this.keyValuePairRepository.delete(
        this.getConfigVariableWhereClause(key as string),
      );
    } catch (error) {
      throw new ConfigVariableException(
        `Failed to delete config variable ${key as string}: ${error instanceof Error ? error.message : String(error)}`,
        ConfigVariableExceptionCode.INTERNAL_ERROR,
      );
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
            this.logger.debug(
              `Skipping invalid config value for key ${key as string}: ${error instanceof Error ? error.message : String(error)}`,
            );

            continue;
          }
        }
      }

      return result;
    } catch (error) {
      throw new ConfigVariableException(
        `Failed to load all config variables: ${error instanceof Error ? error.message : String(error)}`,
        ConfigVariableExceptionCode.INTERNAL_ERROR,
      );
    }
  }
}
