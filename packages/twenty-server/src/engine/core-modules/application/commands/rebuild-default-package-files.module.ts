import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RebuildDefaultPackageFilesCommand } from 'src/engine/core-modules/application/commands/rebuild-default-package-files.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';

@Module({
  imports: [WorkspaceIteratorModule, ApplicationModule],
  providers: [RebuildDefaultPackageFilesCommand],
})
export class RebuildDefaultPackageFilesModule {}
