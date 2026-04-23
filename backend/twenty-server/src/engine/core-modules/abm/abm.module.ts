import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetAccountEntity, ABMCampaignEntity } from './target-account.entity';
import { ABMService } from './target-account.service';

@Module({
  imports: [TypeOrmModule.forFeature([TargetAccountEntity, ABMCampaignEntity])],
  providers: [ABMService],
  exports: [ABMService],
})
export class ABMModule {}