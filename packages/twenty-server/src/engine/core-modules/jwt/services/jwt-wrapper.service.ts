import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

import { createHash } from 'crypto';

import * as jwt from 'jsonwebtoken';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Injectable()
export class JwtWrapperService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService,
  ) {}

  sign(payload: string | object, options?: JwtSignOptions): string {
    // Typescript does not handle well the overloads of the sign method, helping it a little bit
    if (typeof payload === 'object') {
      return this.jwtService.sign(payload, options);
    }

    return this.jwtService.sign(payload, options);
  }

  verify<T extends object = any>(token: string, options?: JwtVerifyOptions): T {
    return this.jwtService.verify(token, options);
  }

  decode<T = any>(payload: string, options: jwt.DecodeOptions): T {
    return this.jwtService.decode(payload, options);
  }

  generateAppSecret(
    type:
      | 'ACCESS'
      | 'LOGIN'
      | 'REFRESH'
      | 'FILE'
      | 'POSTGRES_PROXY'
      | 'REMOTE_SERVER',
    workspaceId?: string,
  ): string {
    const appSecret = this.environmentService.get('APP_SECRET');

    if (!appSecret) {
      throw new Error('APP_SECRET is not set');
    }

    return createHash('sha256')
      .update(`${appSecret}${workspaceId}${type}`)
      .digest('hex');
  }
}
