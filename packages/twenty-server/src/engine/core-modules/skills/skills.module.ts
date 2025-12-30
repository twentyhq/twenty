import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';

import { SkillsService } from './skills.service';

@Module({
  imports: [TypeOrmModule.forFeature([SkillEntity])],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
