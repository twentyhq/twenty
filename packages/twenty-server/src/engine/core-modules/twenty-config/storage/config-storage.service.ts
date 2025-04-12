import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import {
  KeyValuePair,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { convertConfigVarToAppType } from 'src/engine/core-modules/twenty-config/utils/convert-config-var-to-app-type.util';
import { convertConfigVarToStorageType } from 'src/engine/core-modules/twenty-config/utils/convert-config-var-to-storage-type.util';

import { ConfigStorageInterface } from './interfaces/config-storage.interface';

@Injectable()
export class ConfigStorageService implements ConfigStorageInterface {
  private readonly logger = new Logger(ConfigStorageService.name);

  constructor(
    @InjectRepository(KeyValuePair, 'core')
    private readonly keyValuePairRepository: Repository<KeyValuePair>,
  ) {}

  async get<T extends keyof ConfigVariables>(
    key: T,
  ): Promise<ConfigVariables[T] | undefined> {
    try {
      const result = await this.keyValuePairRepository.findOne({
        where: {
          type: KeyValuePairType.CONFIG_VARIABLE,
          key: key as string,
          userId: IsNull(),
          workspaceId: IsNull(),
        },
      });

      if (!result?.value) {
        return undefined;
      }

      try {
        return convertConfigVarToAppType(result.value, key);
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
      let processedValue;

      try {
        processedValue = convertConfigVarToStorageType(value);
      } catch (error) {
        this.logger.error(
          `Failed to convert value to storage type for key ${key as string}`,
          error,
        );
        throw error;
      }

      const existingRecord = await this.keyValuePairRepository.findOne({
        where: {
          key: key as string,
          userId: IsNull(),
          workspaceId: IsNull(),
          type: KeyValuePairType.CONFIG_VARIABLE,
        },
      });

      if (existingRecord) {
        await this.keyValuePairRepository.update(
          { id: existingRecord.id },
          { value: processedValue },
        );
      } else {
        await this.keyValuePairRepository.insert({
          key: key as string,
          value: processedValue,
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
      await this.keyValuePairRepository.delete({
        type: KeyValuePairType.CONFIG_VARIABLE,
        key: key as string,
        userId: IsNull(),
        workspaceId: IsNull(),
      });
    } catch (error) {
      this.logger.error(`Failed to delete config for ${key as string}`, error);
      throw error;
    }
  }

  async loadAll(): Promise<Map<keyof ConfigVariables, any>> {
    try {
      const configVars = await this.keyValuePairRepository.find({
        where: {
          type: KeyValuePairType.CONFIG_VARIABLE,
          userId: IsNull(),
          workspaceId: IsNull(),
        },
      });

      const result = new Map<keyof ConfigVariables, any>();

      for (const configVar of configVars) {
        if (configVar.value !== null) {
          const key = configVar.key as keyof ConfigVariables;

          try {
            const value = convertConfigVarToAppType(configVar.value, key);

            result.set(key, value);
          } catch (error) {
            this.logger.error(
              `Failed to convert value to app type for key ${key as string}`,
              error,
            );
            // Skip this value but continue processing others
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
