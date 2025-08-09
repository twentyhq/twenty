// nestbox: added workspace signup command module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

import { WorkspaceSignupCommand } from './workspace-signup.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Workspace], 'core'),
    AuthModule,
    ApiKeyModule,
    WorkspaceModule,
    DomainManagerModule,
  ],
  providers: [WorkspaceSignupCommand],
})
export class WorkspaceSignupCommandModule {}
