import { Body, Controller, Post, UseFilters } from '@nestjs/common';

import { Verify } from 'src/engine/core-modules/auth/dto/verify.entity';
import { VerifyInput } from 'src/engine/core-modules/auth/dto/verify.input';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { TokenService } from 'src/engine/core-modules/auth/token/services/token.service';

@Controller('auth/verify')
@UseFilters(AuthRestApiExceptionFilter)
export class VerifyAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post()
  async verify(@Body() verifyInput: VerifyInput): Promise<Verify> {
    const email = await this.tokenService.verifyLoginToken(
      verifyInput.loginToken,
    );
    const result = await this.authService.verify(email);

    return result;
  }
}
