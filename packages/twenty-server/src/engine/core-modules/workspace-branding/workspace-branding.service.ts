import { Injectable, Logger } from '@nestjs/common';

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { type Request } from 'express';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';

import { getRequestOrigin } from './utils/get-request-origin.util';

const DEFAULT_DISPLAY_NAME = 'CRM';

export type WorkspaceBranding = {
  displayName: string;
  logoUrl: string;
};

@Injectable()
export class WorkspaceBrandingService {
  private readonly logger = new Logger(WorkspaceBrandingService.name);

  constructor(
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    private readonly fileUrlService: FileUrlService,
  ) {}

  getIndexHtmlTemplate(): string | null {
    const indexPath = join(__dirname, '..', '..', '..', 'front', 'index.html');

    if (!existsSync(indexPath)) {
      return null;
    }

    return readFileSync(indexPath, 'utf8');
  }

  async getBrandingFromRequest(
    request: Request,
  ): Promise<WorkspaceBranding | null> {
    try {
      const origin = getRequestOrigin(request);
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
      this.logger.warn('Failed to resolve workspace branding from request', {
        error,
      });

      return null;
    }
  }
}
