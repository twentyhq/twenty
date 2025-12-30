import { Module } from '@nestjs/common';

import { SkillsService } from './skills.service';

@Module({
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
