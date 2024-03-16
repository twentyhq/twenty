/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Request } from 'express';

import { EnvironmentVariables } from 'src/engine/integrations/environment/environment-variables';
import { EnvironmentDefault } from 'src/engine/integrations/environment/environment.default';

@Injectable()
export class EnvironmentService {
  constructor(private configService: ConfigService) {}

  get<T extends keyof EnvironmentVariables>(key: T): EnvironmentVariables[T] {
    return (
      this.configService.get<EnvironmentVariables[T]>(key) ??
      EnvironmentDefault[key]
    );
  }

  getServerUrl(): string {
    const url = this.configService.get<string>('SERVER_URL')!;

    if (url?.endsWith('/')) {
      return url.substring(0, url.length - 1);
    }

    return url;
  }

  getBaseUrl(request: Request): string {
    return (
      this.getServerUrl() || `${request.protocol}://${request.get('host')}`
    );
  }

  getFrontAuthCallbackUrl(): string {
    return (
      this.configService.get<string>('FRONT_AUTH_CALLBACK_URL') ??
      this.get('FRONT_BASE_URL') + '/verify'
    );
  }

  // TODO: check because it isn't called
  getLoggerIsBufferEnabled(): boolean | undefined {
    return this.configService.get<boolean>('LOGGER_IS_BUFFER_ENABLED') ?? true;
  }
}
