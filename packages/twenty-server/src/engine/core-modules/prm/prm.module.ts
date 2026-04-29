import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerEntity, DealRegistrationEntity, MDFRequestEntity, PartnerSPIFFEntity, PartnerCommunicationEntity } from './prm.entity';
import { PRMService } from './prm.service';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerEntity, DealRegistrationEntity, MDFRequestEntity, PartnerSPIFFEntity, PartnerCommunicationEntity])],
  providers: [PRMService],
  exports: [PRMService],
})
export class PRMModule {}
