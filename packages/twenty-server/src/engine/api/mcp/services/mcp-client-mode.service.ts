import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { isChatGptOAuthRedirectUri } from 'src/engine/api/mcp/utils/is-chatgpt-oauth-redirect-uri.util';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

@Injectable()
export class McpClientModeService {
  constructor(
    private readonly applicationRegistrationLookupService: ApplicationRegistrationLookupService,
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

    // Keep published direct calls working while OpenAI reviews the meta-tool catalog.
    if (method === 'tools/call') {
      return true;
    }

    if (!isDefined(application?.applicationRegistrationId)) {
      return true;
    }

    // Published ChatGPT MCP URLs are locked, so select its stable catalog server-side.
    const applicationRegistration =
      await this.applicationRegistrationLookupService.findOneByUniversalIdentifierGlobal(
        application.universalIdentifier,
      );

    return !applicationRegistration?.oAuthRedirectUris.some(
      isChatGptOAuthRedirectUri,
    );
  }
}
