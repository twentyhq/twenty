import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { isChatGptOAuthRedirectUri } from 'src/engine/api/mcp/utils/is-chatgpt-oauth-redirect-uri.util';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const MCP_CLIENT_MODE_CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class McpClientModeService {
  constructor(
    private readonly applicationRegistrationLookupService: ApplicationRegistrationLookupService,
    @InjectCacheStorage(CacheStorageNamespace.EngineMcpClientMode)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async isDirectMode({
    method,
    mode,
    application,
  }: {
    method: string;
    mode?: string;
    application?: Pick<
      FlatApplication,
      'applicationRegistrationId' | 'universalIdentifier'
    >;
  }): Promise<boolean> {
    if (isDefined(mode)) {
      return mode !== 'meta';
    }

    if (method !== 'initialize' && method !== 'tools/list') {
      return true;
    }

    if (!isDefined(application?.applicationRegistrationId)) {
      return true;
    }

    const cachedIsDirectMode = await this.cacheStorage.get<boolean>(
      application.universalIdentifier,
    );

    if (isDefined(cachedIsDirectMode)) {
      return cachedIsDirectMode;
    }

    // Published ChatGPT MCP URLs are locked, so select its stable catalog server-side.
    const redirectUris =
      await this.applicationRegistrationLookupService.findOAuthRedirectUrisByUniversalIdentifier(
        application.universalIdentifier,
      );
    const isDirectMode = !redirectUris.some(isChatGptOAuthRedirectUri);

    await this.cacheStorage.set(
      application.universalIdentifier,
      isDirectMode,
      MCP_CLIENT_MODE_CACHE_TTL_MS,
    );

    return isDirectMode;
  }
}
