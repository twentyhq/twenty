import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { IsOptional, IsString } from 'class-validator';

import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { OAuthService } from 'src/engine/core-modules/auth/services/oauth.service';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

export class OAuthTokenRequestDto {
  @IsString()
  grant_type: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  redirect_uri?: string;

  @IsOptional()
  @IsString()
  client_id?: string;

  @IsOptional()
  @IsString()
  client_secret?: string;

  @IsOptional()
  @IsString()
  code_verifier?: string;

  @IsOptional()
  @IsString()
  refresh_token?: string;
}

@Controller('oauth')
@UseFilters(AuthRestApiExceptionFilter)
export class OAuthTokenController {
  constructor(private readonly oauthService: OAuthService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PublicEndpointGuard)
  async token(@Body() body: OAuthTokenRequestDto) {
    switch (body.grant_type) {
      case 'authorization_code':
        return this.oauthService.exchangeAuthorizationCode({
          authorizationCode: body.code ?? '',
          clientId: body.client_id ?? '',
          clientSecret: body.client_secret,
          codeVerifier: body.code_verifier,
          redirectUri: body.redirect_uri ?? '',
        });

      case 'client_credentials':
        return this.oauthService.clientCredentialsGrant({
          clientId: body.client_id ?? '',
          clientSecret: body.client_secret ?? '',
        });

      case 'refresh_token':
        return this.oauthService.refreshTokenGrant({
          refreshToken: body.refresh_token ?? '',
          clientId: body.client_id ?? '',
          clientSecret: body.client_secret,
        });

      default:
        return {
          error: 'unsupported_grant_type',
          error_description: `Grant type '${body.grant_type}' is not supported`,
        };
    }
  }
}
