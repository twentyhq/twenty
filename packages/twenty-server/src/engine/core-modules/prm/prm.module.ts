import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerEntity, DealRegistrationEntity, MDFRequestEntity, PartnerSPIFFEntity, PartnerCommunicationEntity } from './prm.entity';
import { PRMService } from './prm.service';
import { PRMResolver } from './prm.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerEntity, DealRegistrationEntity, MDFRequestEntity, PartnerSPIFFEntity, PartnerCommunicationEntity])],
  providers: [PRMService, PRMResolver],
  exports: [PRMService],
})
export class PRMModule {}
