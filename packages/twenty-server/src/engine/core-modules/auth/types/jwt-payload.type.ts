import { type AccessTokenJwtPayload } from 'src/engine/core-modules/auth/types/access-token-jwt-payload.type';
import { type ApiKeyTokenJwtPayload } from 'src/engine/core-modules/auth/types/api-key-token-jwt-payload.type';
import { type ApplicationAccessTokenJwtPayload } from 'src/engine/core-modules/auth/types/application-access-token-jwt-payload.type';
import { type ApplicationRefreshTokenJwtPayload } from 'src/engine/core-modules/auth/types/application-refresh-token-jwt-payload.type';
import { type AppOAuthStateJwtPayload } from 'src/engine/core-modules/auth/types/app-oauth-state-jwt-payload.type';
import { type ApplicationRegistrationGithubClaimStateJwtPayload } from 'src/engine/core-modules/auth/types/application-registration-github-claim-state-jwt-payload.type';
import { type ApprovedAccessDomainJwtPayload } from 'src/engine/core-modules/auth/types/approved-access-domain-jwt-payload.type';
import { type FileTokenJwtPayload } from 'src/engine/core-modules/auth/types/file-token-jwt-payload.type';
import { type FileUploadTokenJwtPayload } from 'src/engine/core-modules/auth/types/file-upload-token-jwt-payload.type';
import { type FileTokenJwtPayloadLegacy } from 'src/engine/core-modules/auth/types/file-token-jwt-payload-legacy.type';
import { type LoginTokenJwtPayload } from 'src/engine/core-modules/auth/types/login-token-jwt-payload.type';
import { type PlaygroundTokenJwtPayload } from 'src/engine/core-modules/auth/types/playground-token-jwt-payload.type';
import { type RefreshTokenJwtPayload } from 'src/engine/core-modules/auth/types/refresh-token-jwt-payload.type';
import { type TransientTokenJwtPayload } from 'src/engine/core-modules/auth/types/transient-token-jwt-payload.type';
import { type WorkspaceAgnosticTokenJwtPayload } from 'src/engine/core-modules/auth/types/workspace-agnostic-token-jwt-payload.type';

export type JwtPayload =
  | AccessTokenJwtPayload
  | ApiKeyTokenJwtPayload
  | ApplicationAccessTokenJwtPayload
  | ApplicationRefreshTokenJwtPayload
  | WorkspaceAgnosticTokenJwtPayload
  | LoginTokenJwtPayload
  | TransientTokenJwtPayload
  | RefreshTokenJwtPayload
  | FileTokenJwtPayload
  | FileTokenJwtPayloadLegacy
  | FileUploadTokenJwtPayload
  | AppOAuthStateJwtPayload
  | ApplicationRegistrationGithubClaimStateJwtPayload
  | ApprovedAccessDomainJwtPayload
  | PlaygroundTokenJwtPayload;
