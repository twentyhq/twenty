import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ITAssetEntity, SoftwareLicenseEntity, ITTicketEntity, ChangeRequestEntity } from './it-asset.entity';
import { ITAssetService } from './it-asset.service';

@Module({
  imports: [TypeOrmModule.forFeature([ITAssetEntity, SoftwareLicenseEntity, ITTicketEntity, ChangeRequestEntity])],
  providers: [ITAssetService],
  exports: [ITAssetService],
})
export class ITAssetModule {}
