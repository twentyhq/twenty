import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { bindDataToRequestObject } from 'src/engine/utils/bind-data-to-request-object.util';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly workspaceStorageCacheService: WorkspaceCacheStorageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const data =
        await this.accessTokenService.validateTokenByRequest(request);
      const metadataVersion = data.workspace
        ? await this.workspaceStorageCacheService.getMetadataVersion(
            data.workspace.id,
          )
        : undefined;

      if (!isDefined(data.apiKey) && !isDefined(data.userWorkspaceId)) {
        this.logger.warn(
          `Auth failed: no apiKey or userWorkspaceId in context`,
        );

        return false;
      }

      bindDataToRequestObject(data, request, metadataVersion);

      return true;
    } catch (error) {
      this.logger.warn(`Auth failed with error: ${error}`);

      return false;
    }
  }
}
