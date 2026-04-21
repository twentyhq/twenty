import { Module } from '@nestjs/common';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { RebuildDefaultPackageFilesCommand } from 'src/engine/core-modules/application/commands/rebuild-default-package-files.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceIteratorModule, ApplicationModule, WorkspaceCacheModule],
  providers: [RebuildDefaultPackageFilesCommand],
})
export class RebuildDefaultPackageFilesModule {}
