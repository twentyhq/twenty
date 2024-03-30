import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { MicrosoftOAuthGuard } from 'src/engine/core-modules/auth/guards/microsoft-oauth.guard';
import { MicrosoftProviderEnabledGuard } from 'src/engine/core-modules/auth/guards/microsoft-provider-enabled.guard';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { TokenService } from 'src/engine/core-modules/auth/services/token.service';
import { MicrosoftRequest } from 'src/engine/core-modules/auth/strategies/microsoft.auth.strategy';
import { User } from 'src/engine/core-modules/user/user.entity';

@Controller('auth/microsoft')
export class MicrosoftAuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly typeORMService: TypeORMService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @UseGuards(MicrosoftProviderEnabledGuard, MicrosoftOAuthGuard)
  async microsoftAuth() {
    // As this method is protected by Microsoft Auth guard, it will trigger Microsoft SSO flow
    return;
  }

  @Get('redirect')
  @UseGuards(MicrosoftProviderEnabledGuard, MicrosoftOAuthGuard)
  async microsoftAuthRedirect(
    @Req() req: MicrosoftRequest,
    @Res() res: Response,
  ) {
    const { firstName, lastName, email, picture, workspaceInviteHash } =
      req.user;

    const mainDataSource = this.typeORMService.getMainDataSource();

    const existingUser = await mainDataSource
      .getRepository(User)
      .findOneBy({ email: email });

    if (existingUser) {
      const loginToken = await this.tokenService.generateLoginToken(
        existingUser.email,
      );

      return res.redirect(
        this.tokenService.computeRedirectURI(loginToken.token),
      );
    }

    const user = await this.authService.signUp({
      email,
      firstName,
      lastName,
      picture,
      workspaceInviteHash,
    });

    const loginToken = await this.tokenService.generateLoginToken(user.email);

    return res.redirect(this.tokenService.computeRedirectURI(loginToken.token));
  }
}
