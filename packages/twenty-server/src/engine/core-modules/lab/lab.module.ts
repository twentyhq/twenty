import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { LabResolver } from './lab.resolver';

import { LabService } from './services/lab.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureFlag, Workspace], 'core')],
  providers: [LabService, LabResolver],
  exports: [LabService],
})
export class LabModule {}
