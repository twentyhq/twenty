import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtWrapperService {
  constructor(private readonly jwtService: JwtService) {}

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
}
