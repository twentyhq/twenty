import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';

import {
  ConfigVariableVersionAction,
  ConfigVariableVersionEntity,
} from './config-variable-version.entity';

@Injectable()
export class ConfigVariableVersionService {
  constructor(
    @InjectRepository(ConfigVariableVersionEntity)
    private readonly configVariableVersionRepository: Repository<ConfigVariableVersionEntity>,
    private readonly configStorageService: ConfigStorageService,
  ) {}

  async recordChange<T extends keyof ConfigVariables>({
    key,
    action,
    previousValue,
    nextValue,
  }: {
    key: T;
    action: ConfigVariableVersionAction;
    previousValue: ConfigVariables[T] | null | undefined;
    nextValue: ConfigVariables[T] | null | undefined;
  }): Promise<void> {
    const [previousSnapshot, nextSnapshot] = await Promise.all([
      this.toStorageSnapshot(key, previousValue),
      this.toStorageSnapshot(key, nextValue),
    ]);

    await this.configVariableVersionRepository.insert({
      key: key as string,
      action,
      previousValue:
        previousSnapshot as ConfigVariableVersionEntity['previousValue'],
      nextValue: nextSnapshot as ConfigVariableVersionEntity['nextValue'],
    });
  }

  async getHistory<T extends keyof ConfigVariables>(
    key?: T,
    limit = 50,
  ): Promise<ConfigVariableVersionEntity[]> {
    const options = {
      order: { createdAt: 'DESC' as const },
      take: limit,
      ...(key ? { where: { key: key as string } } : {}),
    };

    return await this.configVariableVersionRepository.find(options);
  }

  private async toStorageSnapshot<T extends keyof ConfigVariables>(
    key: T,
    value: ConfigVariables[T] | null | undefined,
  ): Promise<unknown> {
    if (value === undefined) {
      return null;
    }

    return await this.configStorageService.toStorageValue(value, key);
  }
}
