import { ForbiddenException, Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { combineCacheHashes } from 'src/engine/workspace-cache/utils/combine-cache-hashes.util';

const RECORD_EXPORT_PERMISSION_CACHE_KEYS: WorkspaceCacheKeyName[] = [
  'rolesPermissions',
  'userWorkspaceRoleMap',
  'flatRoleMaps',
  'flatRowLevelPermissionPredicateMaps',
  'flatRowLevelPermissionPredicateGroupMaps',
  'flatWorkspaceMemberMaps',
  'flatObjectMetadataMaps',
  'flatFieldMetadataMaps',
];

@Injectable()
export class RecordExportSecurityService {
  constructor(
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly userSessionCookieService: UserSessionCookieService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  getRequestTokenHash(request: Request): string {
    const token =
      this.jwtWrapperService.extractJwtFromRequest()(request) ??
      this.userSessionCookieService.extractSessionTokenFromRequest(request);

    if (!isDefined(token)) {
      throw new ForbiddenException(t`Sign in to export records.`);
    }

    return hashUserSessionToken(token);
  }

  assertDownloader({
    request,
    recordExport,
  }: {
    request: Request;
    recordExport: RecordExport;
  }): void {
    if (
      request.workspace?.id !== recordExport.workspaceId ||
      request.userWorkspaceId !== recordExport.userWorkspaceId ||
      request.workspaceMemberId !== recordExport.workspaceMemberId ||
      this.getRequestTokenHash(request) !== recordExport.requestTokenHash
    ) {
      throw new ForbiddenException(
        t`This export belongs to another session. Please create a new export.`,
      );
    }
  }

  async capturePermissionsHash(workspaceId: string): Promise<string> {
    // Capture the data versions used by queries, including any local cache lag.
    const { hashes } =
      await this.workspaceCacheService.getOrRecomputeWithHashes(
        workspaceId,
        RECORD_EXPORT_PERMISSION_CACHE_KEYS,
      );

    return combineCacheHashes(hashes, RECORD_EXPORT_PERMISSION_CACHE_KEYS);
  }

  async assertPermissionsUnchanged(recordExport: RecordExport): Promise<void> {
    if (
      recordExport.permissionsHash !==
      (await this.workspaceCacheService.getOrRecomputeCombinedHash(
        recordExport.workspaceId,
        RECORD_EXPORT_PERMISSION_CACHE_KEYS,
      ))
    ) {
      throw new ForbiddenException(
        t`Access permissions have changed. Please create a new export.`,
      );
    }
  }
}
