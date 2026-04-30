import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MobileAppEntity, MobileDeviceEntity } from './mobile-app.entity';
import { MobileService } from './mobile.service';
import { MobileResolver } from './mobile.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([MobileAppEntity, MobileDeviceEntity])],
  providers: [MobileService, MobileResolver],
  exports: [MobileService],
})
export class MobileModule {}