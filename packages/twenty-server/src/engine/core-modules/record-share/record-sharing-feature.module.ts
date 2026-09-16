/* @license Enterprise */

import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { RecordSharingFeatureService } from 'src/engine/core-modules/record-share/services/record-sharing-feature.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

// Kept apart from RecordShareModule so twenty-orm can resolve the verdict
// without importing the module that depends on it
@Module({
  imports: [DiscoveryModule, WorkspaceCacheModule],
  providers: [RecordSharingFeatureService],
  exports: [RecordSharingFeatureService],
})
export class RecordSharingFeatureModule {}
