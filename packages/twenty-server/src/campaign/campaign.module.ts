import { Module } from '@nestjs/common';

import { CampaignController } from 'src/campaign/campaign.controller';
import { CampaignService } from 'src/campaign/campaign.service';

@Module({
  imports: [],
  controllers: [CampaignController],
  providers: [CampaignService],
})
export class CampaignModule {}
