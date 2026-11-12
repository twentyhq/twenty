import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserWorkspaceSuccessorService } from 'src/engine/core-modules/user-workspace/services/user-workspace-successor.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserWorkspaceEntity]), PermissionsModule],
  providers: [UserWorkspaceSuccessorService],
  exports: [UserWorkspaceSuccessorService],
})
export class UserWorkspaceSuccessorModule {}
