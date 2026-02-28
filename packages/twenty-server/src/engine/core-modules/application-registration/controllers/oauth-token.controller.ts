import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { type Request, type Response } from 'express';

import { OAuthTokenInput } from 'src/engine/core-modules/application-registration/dtos/oauth-token.input';
import { OAuthService } from 'src/engine/core-modules/application-registration/oauth.service';
import { OAuthErrorResponse } from 'src/engine/core-modules/application-registration/types/oauth-error-response.type';
import { OAuthTokenResponse } from 'src/engine/core-modules/application-registration/types/oauth-token-response.type';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

const OAUTH_TOKEN_RATE_LIMIT_MAX = 20;
const OAUTH_TOKEN_RATE_LIMIT_WINDOW_MS = 60_000;

@Controller('oauth')
@UseFilters(AuthRestApiExceptionFilter)
export class OAuthTokenController {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  @Post('token')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @UsePipes(new ValidationPipe())
  async token(
    @Body() body: OAuthTokenInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rateLimitKey = `oauth-token:${body.client_id ?? req.ip}`;

    await this.throttlerService.tokenBucketThrottleOrThrow(
      rateLimitKey,
      1,
      OAUTH_TOKEN_RATE_LIMIT_MAX,
      OAUTH_TOKEN_RATE_LIMIT_WINDOW_MS,
    );

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

    // RFC 6749 §5.1: token responses must not be cached
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');

    if ('error' in result) {
      const statusCode =
        result.error === 'invalid_client' ? 401 : 400;

      res.status(statusCode);
    }

    return result;
  }
}
