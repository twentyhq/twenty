import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { MetadataResolvedFieldResolverRegistry } from 'src/engine/api/common/common-metadata-resolved-fields/services/metadata-resolved-field-resolver.registry';
import { MetadataResolvedFieldService } from 'src/engine/api/common/common-metadata-resolved-fields/services/metadata-resolved-field.service';

@Module({
  imports: [DiscoveryModule],
  providers: [MetadataResolvedFieldResolverRegistry, MetadataResolvedFieldService],
  exports: [MetadataResolvedFieldService],
})
export class MetadataResolvedFieldModule {}
