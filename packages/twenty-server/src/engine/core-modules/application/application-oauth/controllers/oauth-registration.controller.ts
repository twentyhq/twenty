import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { type Request, type Response } from 'express';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { InjectRepository } from '@nestjs/typeorm';
import {
  ALL_OAUTH_SCOPES,
  type OAuthScope,
} from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { OAuthRegisterInput } from 'src/engine/core-modules/application/application-oauth/dtos/oauth-register.input';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { WellKnownOAuthClientRegistrationService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-registration.service';
import { toOAuthClientInformationResponse } from 'src/engine/core-modules/application/application-oauth/utils/to-oauth-client-information-response.util';
import { findWellKnownOAuthClientByRedirectUris } from 'src/engine/core-modules/application/well-known-oauth-client/utils/find-well-known-oauth-client-by-redirect-uris.util';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { validateRedirectUri } from 'src/engine/core-modules/auth/utils/validate-redirect-uri.util';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { Repository } from 'typeorm';

const REGISTRATION_RATE_LIMIT_MAX =
  process.env.NODE_ENV === NodeEnvironment.DEVELOPMENT ? 100 : 10;
const REGISTRATION_RATE_LIMIT_WINDOW_MS = 3_600_000;

const ALLOWED_GRANT_TYPES = ['authorization_code', 'refresh_token'];
const ALLOWED_RESPONSE_TYPES = ['code'];

@Controller(ApiPath.OAuth)
@UseFilters(AuthRestApiExceptionFilter)
export class OAuthRegistrationController {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly throttlerService: ThrottlerService,
    private readonly wellKnownOAuthClientRegistrationService: WellKnownOAuthClientRegistrationService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @Post('register')
  @HttpCode(201)
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @UsePipes(new ValidationPipe())
  async register(
    @Body() body: OAuthRegisterInput,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (
      !this.twentyConfigService.get(
        'IS_OAUTH_DYNAMIC_CLIENT_REGISTRATION_ENABLED',
      )
    ) {
      res.status(404);

      return {
        error: 'not_found',
        error_description:
          'Dynamic client registration is disabled on this server',
      };
    }

    for (const uri of body.redirect_uris) {
      const result = validateRedirectUri(uri);

      if (!result.valid) {
        res.status(400);

        return {
          error: 'invalid_client_metadata',
          error_description: result.reason,
        };
      }
    }

    if (body.redirect_uris.length === 0) {
      res.status(400);

      return {
        error: 'invalid_client_metadata',
        error_description: 'At least one redirect_uri is required',
      };
    }

    const grantTypes = body.grant_types ?? ['authorization_code'];

    for (const grantType of grantTypes) {
      if (!ALLOWED_GRANT_TYPES.includes(grantType)) {
        res.status(400);

        return {
          error: 'invalid_client_metadata',
          error_description: `Unsupported grant_type: ${grantType}. Only authorization_code and refresh_token are allowed for dynamic registrations.`,
        };
      }
    }

    const responseTypes = body.response_types ?? ['code'];

    for (const responseType of responseTypes) {
      if (!ALLOWED_RESPONSE_TYPES.includes(responseType)) {
        res.status(400);

        return {
          error: 'invalid_client_metadata',
          error_description: `Unsupported response_type: ${responseType}`,
        };
      }
    }

    // Dynamic registrations are always public — we don't issue a client
    // secret via DCR. Silently downgrade any auth method to "none".
    const requestedTokenEndpointAuthMethod =
      body.token_endpoint_auth_method ?? 'none';

    if (
      requestedTokenEndpointAuthMethod !== 'none' &&
      requestedTokenEndpointAuthMethod !== 'client_secret_post' &&
      requestedTokenEndpointAuthMethod !== 'client_secret_basic'
    ) {
      res.status(400);

      return {
        error: 'invalid_client_metadata',
        error_description: `Unsupported token_endpoint_auth_method: ${requestedTokenEndpointAuthMethod}`,
      };
    }

    const validScopes: readonly string[] = ALL_OAUTH_SCOPES;
    const requestedScopes = body.scope
      ? body.scope.split(' ').filter((s) => validScopes.includes(s))
      : [...ALL_OAUTH_SCOPES];

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');

    const issuer = `${req.protocol}://${req.get('host')}`;

    // RFC 7591 §3.2.1 lets the server pick the client_id
    const wellKnownOAuthClient = findWellKnownOAuthClientByRedirectUris(
      body.redirect_uris,
    );

    if (isDefined(wellKnownOAuthClient)) {
      const wellKnownOAuthClientRegistration =
        await this.wellKnownOAuthClientRegistrationService.findOrCreateRegistration(
          wellKnownOAuthClient,
        );

      return toOAuthClientInformationResponse({
        registration: wellKnownOAuthClientRegistration,
        issuer,
        redirectUris: body.redirect_uris,
        scopes: requestedScopes.filter((scope) =>
          wellKnownOAuthClientRegistration.oAuthScopes.includes(scope),
        ),
        grantTypes,
        responseTypes,
      });
    }

    // Only new registrations count: a well-known client's users arrive from a few shared IPs and get the seeded client
    const rateLimitResult = await this.applyRateLimit(req);

    if (rateLimitResult) {
      res.status(429);

      return rateLimitResult;
    }

    const registration = await this.applicationRegistrationRepository.save(
      this.applicationRegistrationRepository.create({
        universalIdentifier: v4(),
        name: body.client_name,
        oAuthClientId: v4(),
        oAuthClientSecretHash: null,
        oAuthRedirectUris: body.redirect_uris,
        oAuthScopes: requestedScopes as OAuthScope[],
        createdByUserId: null,
        ownerWorkspaceId: null,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        logo: body.logo_uri ?? null,
      }),
    );

    return toOAuthClientInformationResponse({
      registration,
      issuer,
      grantTypes,
      responseTypes,
    });
  }

  // RFC 7592 read-back. No registration_access_token is issued; the client_id
  // is an unguessable UUID and the fields returned are already public.
  @Get('register/:clientId')
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async readRegistration(
    @Param('clientId') clientId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: {
        oAuthClientId: clientId,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
      },
    });

    if (!registration) {
      res.status(404);

      return {
        error: 'invalid_client',
        error_description: 'Client not found',
      };
    }

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');

    return toOAuthClientInformationResponse({
      registration,
      issuer: `${req.protocol}://${req.get('host')}`,
    });
  }

  private async applyRateLimit(
    req: Request,
  ): Promise<{ error: string; error_description: string } | null> {
    const rateLimitKey = `oauth-register:${req.ip}`;

    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        rateLimitKey,
        1,
        REGISTRATION_RATE_LIMIT_MAX,
        REGISTRATION_RATE_LIMIT_WINDOW_MS,
      );

      return null;
    } catch (error) {
      if (error instanceof ThrottlerException) {
        return {
          error: 'rate_limit_exceeded',
          error_description:
            'Too many registration requests, please try again later',
        };
      }

      throw error;
    }
  }
}
