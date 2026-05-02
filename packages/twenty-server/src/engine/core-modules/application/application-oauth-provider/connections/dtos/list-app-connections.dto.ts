import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class ListAppConnectionsDto {
  @IsString()
  @IsOptional()
  providerName?: string;

  @IsUUID()
  @IsOptional()
  userWorkspaceId?: string;

  @IsIn(['user', 'workspace'])
  @IsOptional()
  scope?: 'user' | 'workspace';
}
