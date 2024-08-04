import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtWrapperService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: Buffer | object, options?: JwtSignOptions): string;

  sign(
    payload: string,
    options?: Omit<JwtSignOptions, keyof jwt.SignOptions>,
  ): string;

  sign(
    payload: string | Buffer | object,
    options?: JwtSignOptions | Omit<JwtSignOptions, keyof jwt.SignOptions>,
  ): string {
    if (payload instanceof Buffer || typeof payload === 'object') {
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
}
