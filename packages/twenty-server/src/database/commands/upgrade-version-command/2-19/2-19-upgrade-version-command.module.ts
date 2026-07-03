import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { BackfillWorkspaceCustomApplicationRegistrationCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-workspace-command-1820000000000-backfill-workspace-custom-application-registration.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    ApplicationModule,
    TypeOrmModule.forFeature([WorkspaceEntity, ApplicationEntity]),
    WorkspaceIteratorModule,
  ],
  providers: [BackfillWorkspaceCustomApplicationRegistrationCommand],
})
export class V2_19_UpgradeVersionCommandModule {}
