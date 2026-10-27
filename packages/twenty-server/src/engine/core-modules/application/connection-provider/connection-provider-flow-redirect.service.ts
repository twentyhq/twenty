import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { type Response } from 'express';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isSafeInternalPath,
} from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ConnectionProviderAuthorizationStateService } from 'src/engine/core-modules/application/connection-provider/connection-provider-authorization-state.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { parseRelativeUrl } from 'src/engine/core-modules/domain/domain-server-config/utils/parse-relative-url.util';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { GuardRedirectService } from 'src/engine/core-modules/guard-redirect/services/guard-redirect.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class ConnectionProviderFlowRedirectService {
  constructor(
    private readonly authorizationStateService: ConnectionProviderAuthorizationStateService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly guardRedirectService: GuardRedirectService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly i18nService: I18nService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async redirectToConnectedApplication({
    res,
    workspaceId,
    applicationId,
    redirectLocation,
  }: {
    res: Response;
    workspaceId: string;
    applicationId: string;
    redirectLocation: string | null;
  }) {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!isDefined(workspace)) {
      throw new ConnectionProviderException(
        `Workspace ${workspaceId} not found after OAuth callback`,
        ConnectionProviderExceptionCode.PROVIDER_NOT_FOUND,
      );
    }

    const hasRedirectLocation = isNonEmptyString(redirectLocation);

    const { pathname, searchParams, hash } = this.parseRedirectLocation({
      redirectLocation,
      fallbackPathname: getSettingsPath(SettingsPath.ApplicationDetail, {
        applicationId,
      }),
    });

    const url = this.workspaceDomainsService.buildWorkspaceURL({
      workspace,
      pathname,
      searchParams,
      hash,
    });

    // Frontend tab list reads the URL hash to pick the active tab.
    if (!hasRedirectLocation) {
      url.hash = 'settings';
    }

    return res.redirect(url.toString());
  }

  async redirectToErrorFromState({
    res,
    state,
    error,
  }: {
    res: Response;
    state: string | undefined;
    error: unknown;
  }) {
    const errorRedirectTarget = isNonEmptyString(state)
      ? await this.authorizationStateService.findErrorRedirectTarget(state)
      : null;

    const workspace = isDefined(errorRedirectTarget)
      ? await this.workspaceRepository.findOneBy({
          id: errorRedirectTarget.workspaceId,
        })
      : null;

    return this.redirectToError({
      res,
      error,
      workspace,
      redirectLocation: errorRedirectTarget?.redirectLocation ?? null,
    });
  }

  redirectToError({
    res,
    error,
    workspace,
    redirectLocation,
  }: {
    res: Response;
    error: unknown;
    workspace: Pick<
      WorkspaceEntity,
      'id' | 'subdomain' | 'customDomain' | 'isCustomDomainEnabled'
    > | null;
    redirectLocation: string | null;
  }) {
    const { pathname, searchParams, hash } = this.parseRedirectLocation({
      redirectLocation,
      fallbackPathname: getSettingsPath(SettingsPath.Accounts),
    });

    return res.redirect(
      this.guardRedirectService.getRedirectErrorUrlAndCaptureExceptions({
        error: error instanceof Error ? error : new Error(String(error)),
        workspace: {
          id: workspace?.id,
          subdomain:
            workspace?.subdomain ??
            this.twentyConfigService.get('DEFAULT_SUBDOMAIN'),
          customDomain: workspace?.customDomain ?? null,
          isCustomDomainEnabled: workspace?.isCustomDomainEnabled ?? false,
        },
        pathname,
        searchParams,
        hash,
        errorMessage: this.getTokenExchangeFailureMessage(error),
      }),
    );
  }

  private parseRedirectLocation({
    redirectLocation,
    fallbackPathname,
  }: {
    redirectLocation: string | null | undefined;
    fallbackPathname: string;
  }) {
    return parseRelativeUrl(
      isDefined(redirectLocation) && isSafeInternalPath(redirectLocation)
        ? redirectLocation
        : fallbackPathname,
    );
  }

  private getTokenExchangeFailureMessage(error: unknown): string | undefined {
    if (
      !(error instanceof ConnectionProviderException) ||
      error.code !== ConnectionProviderExceptionCode.TOKEN_EXCHANGE_FAILED
    ) {
      return undefined;
    }

    return this.i18nService
      .getI18nInstance(SOURCE_LOCALE)
      ._(error.userFriendlyMessage);
  }
}
