import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';

import { ConfigVarDriver } from './config-var-driver.interface';

@Injectable()
export class EnvironmentDriver implements ConfigVarDriver {
  constructor(private readonly configService: ConfigService) {}

  get<T extends keyof EnvironmentVariables>(key: T): EnvironmentVariables[T] {
    return this.configService.get<EnvironmentVariables[T]>(
      key,
      new EnvironmentVariables()[key],
    );
  }

  async initialize(): Promise<void> {
    // Nothing to initialize
  }

  clearCache(key: keyof EnvironmentVariables): void {
    // No cache to clear
  }

  async refreshConfig(key: keyof EnvironmentVariables): Promise<void> {
    // Nothing to refresh
  }
}
