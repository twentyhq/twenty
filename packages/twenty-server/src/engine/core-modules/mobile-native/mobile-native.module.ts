import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MobileSessionEntity, BiometricConfigEntity, OfflineQueueEntity, LocationCheckinEntity } from './mobile-native.entity';
import { MobileNativeService } from './mobile-native.service';
import { MobileNativeResolver } from './mobile-native.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([MobileSessionEntity, BiometricConfigEntity, OfflineQueueEntity, LocationCheckinEntity])],
  providers: [MobileNativeService, MobileNativeResolver],
  exports: [MobileNativeService],
})
export class MobileNativeModule {}
