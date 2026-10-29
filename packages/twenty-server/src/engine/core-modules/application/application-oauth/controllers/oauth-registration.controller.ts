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

import { InjectRepository } from '@nestjs/typeorm';

import { type Request, type Response } from 'express';
import isEqual from 'lodash.isequal';
import { ApiPath } from 'twenty-shared/types';
import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  ALL_OAUTH_SCOPES,
  type OAuthScope,
} from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { OAuthRegisterInput } from 'src/engine/core-modules/application/application-oauth/dtos/oauth-register.input';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { isClientIdMetadataDocumentUrl } from 'src/engine/core-modules/application/application-registration/utils/is-client-id-metadata-document-url.util';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { normalizeRedirectUriForComparison } from 'src/engine/core-modules/auth/utils/is-redirect-uri-registered.util';
import { validateRedirectUri } from 'src/engine/core-modules/auth/utils/validate-redirect-uri.util';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

const REGISTRATION_RATE_LIMIT_MAX =
  process.env.NODE_ENV === NodeEnvironment.DEVELOPMENT ? 100 : 10;
const REGISTRATION_RATE_LIMIT_WINDOW_MS = 3_600_000;

const ALLOWED_GRANT_TYPES = ['authorization_code', 'refresh_token'];
const ALLOWED_RESPONSE_TYPES = ['code'];
const REUSABLE_REGISTRATION_CANDIDATES_LIMIT = 50;

const toComparableSet = (values: string[]): string[] =>
  [...new Set(values)].sort();

@Controller(ApiPath.OAuth)
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

    const validScopes: readonly string[] = ALL_OAUTH_SCOPES;
    const requestedScopes = body.scope
      ? body.scope.split(' ').filter((s) => validScopes.includes(s))
      : [...ALL_OAUTH_SCOPES];

    // MCP clients re-register whenever they lose their cached client_id; reusing an identical public
    // registration keeps a single installed app per client instead of one per reconnect
    const reusableRegistration = await this.findReusableRegistration({
      name: body.client_name,
      redirectUris: body.redirect_uris,
      scopes: requestedScopes,
    });

    const clientId =
      reusableRegistration?.oAuthClientId ??
      (await this.createRegistration({ body, scopes: requestedScopes }));

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
      registration_client_uri: `${issuer}/${ApiPath.OAuth}/register/${clientId}`,
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
      registration_client_uri: `${issuer}/${ApiPath.OAuth}/register/${registration.oAuthClientId}`,
    };
  }

  private async createRegistration({
    body,
    scopes,
  }: {
    body: OAuthRegisterInput;
    scopes: string[];
  }): Promise<string> {
    const clientId = v4();

    await this.applicationRegistrationRepository.save(
      this.applicationRegistrationRepository.create({
        universalIdentifier: v4(),
        name: body.client_name,
        oAuthClientId: clientId,
        oAuthClientSecretHash: null,
        oAuthRedirectUris: body.redirect_uris,
        oAuthScopes: scopes as OAuthScope[],
        createdByUserId: null,
        ownerWorkspaceId: null,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        logo: body.logo_uri ?? null,
      }),
    );

    return clientId;
  }

  private async findReusableRegistration({
    name,
    redirectUris,
    scopes,
  }: {
    name: string;
    redirectUris: string[];
    scopes: string[];
  }): Promise<ApplicationRegistrationEntity | null> {
    const candidates = await this.applicationRegistrationRepository.find({
      where: {
        name,
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        oAuthClientSecretHash: IsNull(),
        ownerWorkspaceId: IsNull(),
      },
      order: { createdAt: 'ASC' },
      take: REUSABLE_REGISTRATION_CANDIDATES_LIMIT,
    });

    const redirectUrisKey = toComparableSet(
      redirectUris.map(normalizeRedirectUriForComparison),
    );
    const scopesKey = toComparableSet(scopes);

    return (
      candidates.find(
        (candidate) =>
          !isClientIdMetadataDocumentUrl(candidate.oAuthClientId) &&
          isEqual(
            toComparableSet(
              candidate.oAuthRedirectUris.map(
                normalizeRedirectUriForComparison,
              ),
            ),
            redirectUrisKey,
          ) &&
          isEqual(toComparableSet(candidate.oAuthScopes), scopesKey),
      ) ?? null
    );
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
