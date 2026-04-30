import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingCampaignEntity, LeadScoreRuleEntity, LeadScoreEntity, CampaignTouchpointEntity } from './marketing-campaign.entity';
import { MarketingCampaignService } from './marketing-campaign.service';
import { MarketingCampaignResolver } from './marketing-campaign.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([MarketingCampaignEntity, LeadScoreRuleEntity, LeadScoreEntity, CampaignTouchpointEntity])],
  providers: [MarketingCampaignService, MarketingCampaignResolver],
  exports: [MarketingCampaignService],
})
export class MarketingCampaignModule {}
