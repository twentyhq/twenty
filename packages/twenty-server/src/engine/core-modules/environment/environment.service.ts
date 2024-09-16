/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';

@Injectable()
export class EnvironmentService {
  constructor(private readonly configService: ConfigService) {}

  get<T extends keyof EnvironmentVariables>(key: T): EnvironmentVariables[T] {
    return this.configService.get<EnvironmentVariables[T]>(
      key,
      new EnvironmentVariables()[key],
    );
  }
}
