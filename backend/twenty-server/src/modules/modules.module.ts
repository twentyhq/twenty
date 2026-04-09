import { Module } from '@nestjs/common';

import { AutomationRuleModule } from 'src/modules/automation-rule/automation-rule.module';
import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { CrmAccelerationModule } from 'src/modules/crm-acceleration/crm-acceleration.module';
import { DocumentModule } from 'src/modules/document/document.module';
import { ElectronicSignatureModule } from 'src/modules/electronic-signature/electronic-signature.module';
import { FavoriteFolderModule } from 'src/modules/favorite-folder/favorite-folder.module';
import { FavoriteModule } from 'src/modules/favorite/favorite.module';
import { GamificationModule } from 'src/modules/gamification/gamification.module';
import { InventoryModule } from 'src/modules/inventory/inventory.module';
import { KnowledgeBaseModule } from 'src/modules/knowledge-base/knowledge-base.module';
import { LeadScoringModule } from 'src/modules/lead-scoring/lead-scoring.module';
import { LiveChatModule } from 'src/modules/live-chat/live-chat.module';
import { MarketingCampaignModule } from 'src/modules/marketing-campaign/marketing-campaign.module';
import { MarketplaceModule } from 'src/modules/marketplace/marketplace.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';
import { OmnichannelModule } from 'src/modules/omnichannel/omnichannel.module';
import { PipelineModule } from 'src/modules/pipeline/pipeline.module';
import { ProductModule } from 'src/modules/product/product.module';
import { ProjectModule } from 'src/modules/project/project.module';
import { QuoteModule } from 'src/modules/quote/quote.module';
import { SupportTicketModule } from 'src/modules/support-ticket/support-ticket.module';
import { VoIPModule } from 'src/modules/voip/voip.module';
import { WorkflowModule } from 'src/modules/workflow/workflow.module';
import { WorkspaceMemberModule } from 'src/modules/workspace-member/workspace-member.module';

@Module({
  imports: [
    MessagingModule,
    CalendarModule,
    ConnectedAccountModule,
    WorkflowModule,
    FavoriteFolderModule,
    FavoriteModule,
    WorkspaceMemberModule,
    CrmAccelerationModule,
    PipelineModule,
    GamificationModule,
    InventoryModule,
    OmnichannelModule,
    MarketplaceModule,
    VoIPModule,
    ElectronicSignatureModule,
    LeadScoringModule,
    LiveChatModule,
    AutomationRuleModule,
    KnowledgeBaseModule,
    MarketingCampaignModule,
    SupportTicketModule,
    ProjectModule,
    ProductModule,
    QuoteModule,
    DocumentModule,
  ],
  providers: [],
  exports: [],
})
export class ModulesModule {}
