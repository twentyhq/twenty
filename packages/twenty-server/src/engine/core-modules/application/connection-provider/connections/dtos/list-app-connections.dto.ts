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

  // Optional visibility filter — narrow to 'user' or 'workspace' only.
  @IsString()
  @IsOptional()
  visibility?: 'user' | 'workspace';
}
