import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly workspaceStorageCacheService: WorkspaceCacheStorageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const data =
        await this.accessTokenService.validateTokenByRequest(request);
      const metadataVersion =
        await this.workspaceStorageCacheService.getMetadataVersion(
          data.workspace.id,
        );

      request.user = data.user;
      request.apiKey = data.apiKey;
      request.workspace = data.workspace;
      request.workspaceId = data.workspace.id;
      request.workspaceMetadataVersion = metadataVersion;
      request.workspaceMemberId = data.workspaceMemberId;

      return true;
    } catch (error) {
      return false;
    }
  }
}
