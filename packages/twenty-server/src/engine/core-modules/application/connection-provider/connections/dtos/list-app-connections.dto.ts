import { IsEnum, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

import { type ConnectedAccountScope } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountScopeEnum } from 'src/engine/metadata-modules/connected-account/enums/connected-account-scope.enum';

export class ListAppConnectionsDto {
  @IsString()
  @IsOptional()
  providerName?: string;

  // Optional UUID filter — when set, only credentials owned by this user are
  // returned. The privacy filter on the server still applies on top of this.
  @IsUUID()
  @IsOptional()
  userWorkspaceId?: string;

  @IsEnum(ConnectedAccountScopeEnum)
  @IsOptional()
  scope?: ConnectedAccountScope;

  @IsIn(['user', 'workspace'])
  @IsOptional()
  visibility?: 'user' | 'workspace';
}
