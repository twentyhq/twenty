import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ListAppConnectionsDto {
  @IsString()
  @IsOptional()
  providerName?: string;

  // Optional UUID filter — when set, only credentials owned by this user are
  // returned. The privacy filter on the server still applies on top of this.
  @IsUUID()
  @IsOptional()
  userWorkspaceId?: string;

  // Optional scope filter — narrow to 'user' or 'workspace'-scoped only.
  @IsString()
  @IsOptional()
  scope?: 'user' | 'workspace';
}
