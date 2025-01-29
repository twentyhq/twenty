/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  EnvironmentVariablesMetadataOptions,
  METADATA_KEY,
} from 'src/engine/core-modules/environment/decorators/environment-variables-metadata.decorator';
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

  getAll(): Record<
    string,
    {
      value: EnvironmentVariables[keyof EnvironmentVariables];
      metadata: EnvironmentVariablesMetadataOptions;
    }
  > {
    const envVars = new EnvironmentVariables();
    const result: Record<
      string,
      {
        value: EnvironmentVariables[keyof EnvironmentVariables];
        metadata: EnvironmentVariablesMetadataOptions;
      }
    > = {};

    const properties = Object.getOwnPropertyNames(envVars);

    properties.forEach((key) => {
      const metadata = Reflect.getMetadata(
        METADATA_KEY,
        EnvironmentVariables.prototype,
        key,
      );

      if (metadata) {
        result[key] = {
          value: this.get(key as keyof EnvironmentVariables),
          metadata,
        };
      }
    });

    return result;
  }
}
