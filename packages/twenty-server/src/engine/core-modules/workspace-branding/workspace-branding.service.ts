import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { readFileSync } from 'fs';

import { isNonEmptyString } from '@sniptt/guards';

import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { getFrontIndexHtmlPath } from './utils/get-front-index-html-path.util';
import { getRequestOrigin } from './utils/get-request-origin.util';

const DEFAULT_DISPLAY_NAME = 'CRM';

export type WorkspaceBranding = {
  displayName: string;
  logoUrl: string;
};

@Injectable()
export class WorkspaceBrandingService implements OnModuleInit {
  private readonly logger = new Logger(WorkspaceBrandingService.name);

  private indexHtmlTemplate: string | null = null;

  constructor(
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly fileUrlService: FileUrlService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  onModuleInit() {
    const indexPath = getFrontIndexHtmlPath();

    if (!isDefined(indexPath)) {
      this.logger.warn(
        'Frontend index.html not found — workspace branding middleware will pass through to static files',
      );

      return;
    }

    this.indexHtmlTemplate = readFileSync(indexPath, 'utf8');
  }

  getIndexHtmlTemplate(): string | null {
    return this.indexHtmlTemplate;
  }

  async getBrandingFromRequest(
    request: Request,
  ): Promise<WorkspaceBranding | null> {
    const originCandidates = this.getOriginCandidates(request);

    for (const origin of originCandidates) {
      const branding = await this.getBrandingFromOrigin(origin);

      if (isDefined(branding)) {
        return branding;
      }
    }

    return null;
  }

  private getOriginCandidates(request: Request): string[] {
    const requestOrigin = getRequestOrigin(request);
    const configuredOrigins = [
      this.twentyConfigService.get('SERVER_URL'),
      this.twentyConfigService.get('FRONTEND_URL'),
    ].filter(isNonEmptyString);

    return [...new Set([requestOrigin, ...configuredOrigins])];
  }

  private async getBrandingFromOrigin(
    origin: string,
  ): Promise<WorkspaceBranding | null> {
    try {
      const workspace =
        await this.workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
          origin,
        );

      if (!isDefined(workspace)) {
        return null;
      }

      const logoUrl = await this.fileUrlService.signWorkspaceLogoUrl(workspace);

      if (!isDefined(logoUrl)) {
        return null;
      }

      const displayName = isNonEmptyString(workspace.displayName)
        ? workspace.displayName
        : DEFAULT_DISPLAY_NAME;

      return {
        displayName,
        logoUrl,
      };
    } catch (error) {
      this.logger.warn('Failed to resolve workspace branding from origin', {
        origin,
        error,
      });

      return null;
    }
  }
}
