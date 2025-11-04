import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedStandardApplicationsCommand } from 'src/database/commands/upgrade-version-command/1-11/1-11-seed-standard-applications.command';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity, ApplicationEntity]),
    ApplicationModule,
  ],
  providers: [SeedStandardApplicationsCommand],
  exports: [SeedStandardApplicationsCommand],
})
export class V1_11_UpgradeVersionCommandModule {}

