import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantConfigEntity, TenantModuleEntity, ModuleCatalogEntity, FiscalConfigEntity, EventLogEntity } from './saas-platform.entity';
import { SaaSPlatformService } from './saas-platform.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    TenantConfigEntity, TenantModuleEntity, ModuleCatalogEntity, FiscalConfigEntity, EventLogEntity,
  ])],
  providers: [SaaSPlatformService],
  exports: [SaaSPlatformService],
})
export class SaaSPlatformModule {}
