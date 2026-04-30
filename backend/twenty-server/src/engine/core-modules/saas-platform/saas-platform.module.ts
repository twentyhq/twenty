import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantConfigEntity, TenantModuleEntity, ModuleCatalogEntity, FiscalConfigEntity, EventLogEntity } from './saas-platform.entity';
import { SaaSPlatformService } from './saas-platform.service';
import { SaaSPlatformResolver } from './saas-platform.resolver';
import { SaaSPlatformController } from './saas-platform.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    TenantConfigEntity, TenantModuleEntity, ModuleCatalogEntity, FiscalConfigEntity, EventLogEntity,
  ])],
  controllers: [SaaSPlatformController],
  providers: [SaaSPlatformService, SaaSPlatformResolver],
  exports: [SaaSPlatformService],
})
export class SaaSPlatformModule {}
