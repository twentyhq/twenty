import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { WorkspaceFlatMapCacheRegistryService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache-registry.service';

import { FlatEntityMapsCacheService } from './flat-entity-maps-cache.service';

@Module({
  imports: [DiscoveryModule],
  providers: [FlatEntityMapsCacheService, WorkspaceFlatMapCacheRegistryService],
  exports: [FlatEntityMapsCacheService],
})
export class FlatEntityMapsCacheModule {}
