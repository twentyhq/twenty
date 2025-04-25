import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_INSTANCE_TOKEN } from 'src/engine/core-modules/twenty-config/constants/config-variables-instance-tokens.constants';

@Injectable()
export class EnvironmentConfigDriver {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CONFIG_VARIABLES_INSTANCE_TOKEN)
    private readonly defaultConfigVariables: ConfigVariables,
  ) {}

  get<T extends keyof ConfigVariables>(key: T): ConfigVariables[T] {
    return this.configService.get<ConfigVariables[T]>(
      key,
      this.defaultConfigVariables[key],
    );
  }
}
