import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { VerifyInput } from 'src/engine/core-modules/auth/dto/verify.input';
import { Verify } from 'src/engine/core-modules/auth/dto/verify.entity';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';

@Controller('auth/verify')
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
