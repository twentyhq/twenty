import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetAccountEntity, ABMCampaignEntity } from './target-account.entity';
import { ABMService } from './target-account.service';
import { ABMResolver } from './abm.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([TargetAccountEntity, ABMCampaignEntity])],
  providers: [ABMService, ABMResolver],
  exports: [ABMService],
})
export class ABMModule {}