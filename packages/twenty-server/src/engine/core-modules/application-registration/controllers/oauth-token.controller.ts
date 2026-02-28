import {
  Body,
  Controller,
  Post,
  Res,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { type Response } from 'express';

import { OAuthTokenInput } from 'src/engine/core-modules/application-registration/dtos/oauth-token.input';
import { OAuthService } from 'src/engine/core-modules/application-registration/oauth.service';
import { OAuthErrorResponse } from 'src/engine/core-modules/application-registration/types/oauth-error-response.type';
import { OAuthTokenResponse } from 'src/engine/core-modules/application-registration/types/oauth-token-response.type';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller('oauth')
@UseFilters(AuthRestApiExceptionFilter)
export class OAuthTokenController {
  constructor(private readonly oauthService: OAuthService) {}

  @Post('token')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @UsePipes(new ValidationPipe())
  async token(
    @Body() body: OAuthTokenInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    let result: OAuthTokenResponse | OAuthErrorResponse;

    switch (body.grant_type) {
      case 'authorization_code':
        result = await this.oauthService.exchangeAuthorizationCode({
          authorizationCode: body.code ?? '',
          clientId: body.client_id ?? '',
          clientSecret: body.client_secret,
          codeVerifier: body.code_verifier,
          redirectUri: body.redirect_uri ?? '',
        });
        break;

      case 'client_credentials':
        result = await this.oauthService.clientCredentialsGrant({
          clientId: body.client_id ?? '',
          clientSecret: body.client_secret ?? '',
        });
        break;

      case 'refresh_token':
        result = await this.oauthService.refreshTokenGrant({
          refreshToken: body.refresh_token ?? '',
          clientId: body.client_id ?? '',
          clientSecret: body.client_secret,
        });
        break;

      default:
        result = {
          error: 'unsupported_grant_type',
          error_description:
            'The provided grant_type is not supported. Supported values: authorization_code, client_credentials, refresh_token',
        };
        break;
    }

    res.status('error' in result ? 400 : 200);

    return result;
  }
}
