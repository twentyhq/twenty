import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { DynamicFieldResolverRegistry } from 'src/engine/api/common/common-dynamic-fields/services/dynamic-field-resolver.registry';
import { DynamicFieldService } from 'src/engine/api/common/common-dynamic-fields/services/dynamic-field.service';

@Module({
  imports: [DiscoveryModule],
  providers: [DynamicFieldResolverRegistry, DynamicFieldService],
  exports: [DynamicFieldService],
})
export class DynamicFieldModule {}
