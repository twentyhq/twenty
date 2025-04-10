import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
@Injectable()
export class EnvironmentConfigDriver {
  constructor(private readonly configService: ConfigService) {}

  get<T extends keyof ConfigVariables>(key: T): ConfigVariables[T] {
    return this.configService.get<ConfigVariables[T]>(
      key,
      new ConfigVariables()[key],
    );
  }
}
