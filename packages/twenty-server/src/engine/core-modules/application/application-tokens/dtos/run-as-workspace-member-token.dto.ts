import { IsUUID } from 'class-validator';

export class RunAsWorkspaceMemberTokenDto {
  @IsUUID()
  workspaceMemberId: string;
}
