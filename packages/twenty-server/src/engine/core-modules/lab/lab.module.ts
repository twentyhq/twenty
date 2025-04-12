import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceFeatureFlagMapCacheModule } from 'src/engine/metadata-modules/workspace-feature-flag-map-cache.service.ts/workspace-roles-feature-flag-map-cache.module';

import { LabResolver } from './lab.resolver';

@Module({
  imports: [
    FeatureFlagModule,
    PermissionsModule,
    WorkspaceFeatureFlagMapCacheModule,
  ],
  providers: [LabResolver],
  exports: [],
})
export class LabModule {}
