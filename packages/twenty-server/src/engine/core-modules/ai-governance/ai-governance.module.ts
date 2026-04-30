import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIUsageLogEntity, PIIMaskingRuleEntity, ModelConfigEntity, PromptTemplateEntity, AIAuditEntryEntity } from './ai-governance.entity';
import { AIGovernanceService } from './ai-governance.service';
import { AIGovernanceResolver } from './ai-governance.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([AIUsageLogEntity, PIIMaskingRuleEntity, ModelConfigEntity, PromptTemplateEntity, AIAuditEntryEntity])],
  providers: [AIGovernanceService, AIGovernanceResolver],
  exports: [AIGovernanceService],
})
export class AIGovernanceModule {}
