import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIUsageLogEntity, PIIMaskingRuleEntity, ModelConfigEntity, PromptTemplateEntity, AIAuditEntryEntity } from './ai-governance.entity';
import { AIGovernanceService } from './ai-governance.service';
import { AIGovernanceResolver } from './ai-governance.resolver';
import { LLMClientService } from './llm-client.service';

@Module({
  imports: [TypeOrmModule.forFeature([AIUsageLogEntity, PIIMaskingRuleEntity, ModelConfigEntity, PromptTemplateEntity, AIAuditEntryEntity])],
  providers: [AIGovernanceService, AIGovernanceResolver, LLMClientService],
  exports: [AIGovernanceService, LLMClientService],
})
export class AIGovernanceModule {}
