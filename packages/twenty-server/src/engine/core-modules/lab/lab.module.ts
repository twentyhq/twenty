import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { LabResolver } from './lab.resolver';

import { LabService } from './services/lab.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureFlag, Workspace], 'core'),
    FeatureFlagModule,
    PermissionsModule,
  ],
  providers: [LabService, LabResolver],
  exports: [LabService],
})
export class LabModule {}
