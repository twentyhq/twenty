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
import { v4 } from 'uuid';

import { InjectRepository } from '@nestjs/typeorm';
import {
  ALL_OAUTH_SCOPES,
  type OAuthScope,
} from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { OAuthRegisterInput } from 'src/engine/core-modules/application/application-oauth/dtos/oauth-register.input';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { validateRedirectUri } from 'src/engine/core-modules/auth/utils/validate-redirect-uri.util';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { Repository } from 'typeorm';

// RFC 7591: 10 registrations per hour per IP
const REGISTRATION_RATE_LIMIT_MAX =
  process.env.NODE_ENV === NodeEnvironment.DEVELOPMENT ? 100 : 10;
const REGISTRATION_RATE_LIMIT_WINDOW_MS = 3_600_000;

const ALLOWED_GRANT_TYPES = ['authorization_code', 'refresh_token'];
const ALLOWED_RESPONSE_TYPES = ['code'];

@Controller('oauth')
@UseFilters(AuthRestApiExceptionFilter)
export class OAuthRegistrationController {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly throttlerService: ThrottlerService,
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
    const rateLimitResult = await this.applyRateLimit(req);

    if (rateLimitResult) {
      res.status(429);

      return rateLimitResult;
    }

    // Validate redirect URIs
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

    // Validate grant_types — only authorization_code allowed for dynamic clients
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

    // Validate response_types
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
    const tokenEndpointAuthMethod = 'none';

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

    // Parse and validate scopes — cap to allowed scopes
    const validScopes: readonly string[] = ALL_OAUTH_SCOPES;
    const requestedScopes = body.scope
      ? body.scope.split(' ').filter((s) => validScopes.includes(s))
      : [...ALL_OAUTH_SCOPES];

    const clientId = v4();

    const registration = this.applicationRegistrationRepository.create({
      universalIdentifier: v4(),
      name: body.client_name,
      oAuthClientId: clientId,
      oAuthClientSecretHash: null,
      oAuthRedirectUris: body.redirect_uris,
      oAuthScopes: requestedScopes as OAuthScope[],
      createdByUserId: null,
      ownerWorkspaceId: null,
      sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
    });

    await this.applicationRegistrationRepository.save(registration);

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');

    const issuer = `${req.protocol}://${req.get('host')}`;

    return {
      client_id: clientId,
      client_name: body.client_name,
      redirect_uris: body.redirect_uris,
      grant_types: grantTypes,
      response_types: responseTypes,
      token_endpoint_auth_method: tokenEndpointAuthMethod,
      scope: requestedScopes.join(' '),
      client_id_issued_at: Math.floor(Date.now() / 1000),
      registration_client_uri: `${issuer}/oauth/register/${clientId}`,
    };
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

    const issuer = `${req.protocol}://${req.get('host')}`;

    return {
      client_id: registration.oAuthClientId,
      client_name: registration.name,
      redirect_uris: registration.oAuthRedirectUris,
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
      scope: registration.oAuthScopes.join(' '),
      registration_client_uri: `${issuer}/oauth/register/${registration.oAuthClientId}`,
    };
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
