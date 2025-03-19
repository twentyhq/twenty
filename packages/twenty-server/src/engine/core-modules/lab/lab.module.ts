import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { LabResolver } from './lab.resolver';

@Module({
  imports: [FeatureFlagModule, PermissionsModule],
  providers: [LabResolver],
  exports: [],
})
export class LabModule {}
