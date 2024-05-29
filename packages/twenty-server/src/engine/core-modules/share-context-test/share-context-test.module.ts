import { Module } from '@nestjs/common';

import { SharedService } from 'src/engine/core-modules/share-context-test/shared.service';
import { TestJob } from 'src/engine/core-modules/share-context-test/test.job';
import { TestListener } from 'src/engine/core-modules/share-context-test/test.listener';
import { TestResolver } from 'src/engine/core-modules/share-context-test/test.resolver';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Module({
  imports: [TwentyORMModule.forFeature([WorkspaceMemberWorkspaceEntity])],
  providers: [TestListener, TestResolver, TestJob, SharedService],
  exports: [SharedService],
})
export class ShareContextTestModule {}
