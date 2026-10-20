import { UseFilters, UseGuards } from '@nestjs/common';
import { Context, Query } from '@nestjs/graphql';

import { type Request } from 'express';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { getRequestCountryCode } from 'src/engine/core-modules/cloudflare/utils/get-request-country-code.util';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(
  AuthPrincipalGuard({
    userSession: true,
    apiKey: false,
    oauthClient: false,
    application: false,
  }),
  NoPermissionGuard,
)
@MetadataResolver()
export class CloudflareResolver {
  @Query(() => String, { nullable: true })
  requestCountryCode(@Context() context: { req: Request }): string | null {
    return getRequestCountryCode(context.req);
  }
}
