import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';

import { SkillsService } from './skills.service';

@Module({
  imports: [WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
