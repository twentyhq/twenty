import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AIUsageLogEntity, PIIMaskingRuleEntity, ModelConfigEntity, PromptTemplateEntity, AIAuditEntryEntity,
  AIProvider, MaskingStrategy, AuditAction,
} from './ai-governance.entity';
import { LLMClientService, LLMResponse, LLMProvider } from './llm-client.service';

@Injectable()
export class AIGovernanceService {
  private readonly logger = new Logger(AIGovernanceService.name);

  constructor(
    @InjectRepository(AIUsageLogEntity) private readonly usageLogRepo: Repository<AIUsageLogEntity>,
    @InjectRepository(PIIMaskingRuleEntity) private readonly maskingRuleRepo: Repository<PIIMaskingRuleEntity>,
    @InjectRepository(ModelConfigEntity) private readonly modelConfigRepo: Repository<ModelConfigEntity>,
    @InjectRepository(PromptTemplateEntity) private readonly promptRepo: Repository<PromptTemplateEntity>,
    @InjectRepository(AIAuditEntryEntity) private readonly auditRepo: Repository<AIAuditEntryEntity>,
    private readonly llmClient: LLMClientService,
  ) {}

  async logUsage(workspaceId: string, data: Partial<AIUsageLogEntity>): Promise<AIUsageLogEntity> {
    const log = await this.usageLogRepo.save(this.usageLogRepo.create({ workspaceId, ...data }));

    // Update model monthly spend
    const config = await this.modelConfigRepo.findOne({
      where: { workspaceId, provider: data.provider, modelId: data.model },
    });
    if (config) {
      config.monthlySpend = Number(config.monthlySpend) + Number(data.cost ?? 0);
      if (config.monthlyBudget && Number(config.monthlySpend) > Number(config.monthlyBudget) * 0.9) {
        this.logger.warn(`AI budget alert: ${config.displayName ?? config.modelId} at ${Math.round(Number(config.monthlySpend) / Number(config.monthlyBudget) * 100)}% of monthly budget`);
      }
      await this.modelConfigRepo.save(config);
    }

    return log;
  }

  async maskPII(workspaceId: string, text: string): Promise<{ maskedText: string; detectedPII: Array<{ category: string; count: number }> }> {
    const rules = await this.maskingRuleRepo.find({
      where: { workspaceId, isActive: true },
      order: { priority: 'DESC' },
    });

    let maskedText = text;
    const detectedPII: Array<{ category: string; count: number }> = [];

    for (const rule of rules) {
      try {
        const regex = new RegExp(rule.pattern, 'gi');
        const matches = maskedText.match(regex);

        if (matches && matches.length > 0) {
          detectedPII.push({ category: rule.category, count: matches.length });

          let replacement: string;
          switch (rule.strategy) {
            case MaskingStrategy.REDACT:
              replacement = '[REDACTED]';
              break;
            case MaskingStrategy.HASH:
              replacement = `[HASH:${rule.category.toUpperCase()}]`;
              break;
            case MaskingStrategy.REPLACE:
              replacement = rule.replacement ?? '[REPLACED]';
              break;
            case MaskingStrategy.TOKENIZE:
              replacement = `[TOKEN:${Math.random().toString(36).substring(7)}]`;
              break;
            default:
              replacement = '[MASKED]';
          }

          maskedText = maskedText.replace(regex, replacement);
          rule.matchCount += matches.length;
          await this.maskingRuleRepo.save(rule);
        }
      } catch (error) {
        this.logger.warn(`Invalid masking rule pattern: ${rule.pattern}`);
      }
    }

    return { maskedText, detectedPII };
  }

  async getModelConfig(workspaceId: string): Promise<ModelConfigEntity[]> {
    return this.modelConfigRepo.find({
      where: { workspaceId },
      order: { provider: 'ASC', modelId: 'ASC' },
    });
  }

  async executeWithGovernance(workspaceId: string, userId: string, data: {
    provider: AIProvider; model: string; inputText: string; feature: string;
  }): Promise<{ maskedInput: string; modelConfig: ModelConfigEntity | null; auditId: string; approved: boolean }> {
    // Check model config
    const config = await this.modelConfigRepo.findOne({
      where: { workspaceId, provider: data.provider, modelId: data.model, isEnabled: true },
    });

    if (!config) {
      const audit = await this.auditRepo.save(this.auditRepo.create({
        workspaceId, userId, action: AuditAction.POLICY_VIOLATION,
        resource: data.model, details: 'Model not enabled or not found',
        isFlagged: true,
      }));
      return { maskedInput: data.inputText, modelConfig: null, auditId: audit.id, approved: false };
    }

    // Check allowed features
    if (config.allowedFeatures && config.allowedFeatures.length > 0) {
      if (!config.allowedFeatures.includes(data.feature)) {
        const audit = await this.auditRepo.save(this.auditRepo.create({
          workspaceId, userId, action: AuditAction.POLICY_VIOLATION,
          resource: data.model, details: `Feature "${data.feature}" not allowed for model ${data.model}`,
          isFlagged: true,
        }));
        return { maskedInput: data.inputText, modelConfig: config, auditId: audit.id, approved: false };
      }
    }

    // Check budget
    if (config.monthlyBudget && Number(config.monthlySpend) >= Number(config.monthlyBudget)) {
      const audit = await this.auditRepo.save(this.auditRepo.create({
        workspaceId, userId, action: AuditAction.POLICY_VIOLATION,
        resource: data.model, details: 'Monthly budget exceeded',
        isFlagged: true,
      }));
      return { maskedInput: data.inputText, modelConfig: config, auditId: audit.id, approved: false };
    }

    // Mask PII
    const { maskedText, detectedPII } = await this.maskPII(workspaceId, data.inputText);

    // Audit entry
    const audit = await this.auditRepo.save(this.auditRepo.create({
      workspaceId, userId,
      action: detectedPII.length > 0 ? AuditAction.PII_MASKED : AuditAction.PROMPT,
      resource: `${data.provider}/${data.model}`,
      details: detectedPII.length > 0
        ? `PII detected and masked: ${detectedPII.map((p) => `${p.category}(${p.count})`).join(', ')}`
        : `Prompt sent to ${data.model}`,
      isFlagged: false,
    }));

    return { maskedInput: maskedText, modelConfig: config, auditId: audit.id, approved: true };
  }

  async callLLM(
    workspaceId: string,
    userId: string,
    options: {
      feature: string;
      provider?: LLMProvider;
      model?: string;
      messages: Array<{ role: string; content: string }>;
      temperature?: number;
      maxTokens?: number;
      jsonMode?: boolean;
    },
  ): Promise<LLMResponse> {
    const provider = options.provider ?? 'openai';
    const model = options.model ?? this.getDefaultModel(provider);

    // Run governance checks
    const inputText = options.messages.map((m) => m.content).join('\n');
    const governance = await this.executeWithGovernance(workspaceId, userId, {
      provider: provider as unknown as AIProvider,
      model,
      inputText,
      feature: options.feature,
    });

    if (!governance.approved) {
      throw new Error(
        `LLM call not approved by governance: ${governance.modelConfig ? 'policy violation' : 'model not configured'}`,
      );
    }

    // Get API key from model config or environment
    const apiKey = await this.llmClient.getApiKey(workspaceId, provider, model);

    if (!apiKey) {
      throw new Error(
        `No API key configured for ${provider}/${model}. Set it in workspace AI model config or via environment variable.`,
      );
    }

    // Replace input text with PII-masked version in messages
    const maskedMessages = options.messages.map((message) => {
      if (message.role === 'system') return message;

      // Apply the masking ratio: find and replace content that was masked
      let maskedContent = message.content;

      if (governance.maskedInput !== inputText) {
        // PII was detected; re-mask this specific message
        const originalSegments = inputText.split('\n');
        const maskedSegments = governance.maskedInput.split('\n');
        const segmentMap = new Map<string, string>();

        for (let i = 0; i < originalSegments.length; i++) {
          if (originalSegments[i] !== maskedSegments[i]) {
            segmentMap.set(originalSegments[i], maskedSegments[i]);
          }
        }

        for (const [original, masked] of segmentMap) {
          if (maskedContent.includes(original)) {
            maskedContent = maskedContent.replace(original, masked);
          }
        }
      }

      return { role: message.role, content: maskedContent };
    });

    // Make the LLM call
    const response = await this.llmClient.callAndLog(
      workspaceId,
      userId,
      options.feature,
      {
        provider,
        model,
        messages: maskedMessages,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        jsonMode: options.jsonMode,
      },
      apiKey,
    );

    // Log completion audit
    await this.auditRepo.save(
      this.auditRepo.create({
        workspaceId,
        userId,
        action: AuditAction.COMPLETION,
        resource: `${provider}/${model}`,
        details: `Completed ${options.feature}: ${response.tokensUsed.input}in/${response.tokensUsed.output}out tokens, $${response.cost.toFixed(4)}`,
        isFlagged: false,
        relatedLogId: governance.auditId,
      }),
    );

    return response;
  }

  private getDefaultModel(provider: LLMProvider): string {
    switch (provider) {
      case 'openai':
        return 'gpt-4o';
      case 'anthropic':
        return 'claude-sonnet-4-20250514';
      case 'google':
        return 'gemini-2.5-pro';
      default:
        return 'gpt-4o';
    }
  }

  async getUsageCost(workspaceId: string): Promise<{
    totalCost: number; byProvider: Record<string, number>; byModel: Record<string, number>;
    byFeature: Record<string, number>; totalRequests: number; avgLatencyMs: number;
  }> {
    const logs = await this.usageLogRepo.find({ where: { workspaceId } });

    const byProvider: Record<string, number> = {};
    const byModel: Record<string, number> = {};
    const byFeature: Record<string, number> = {};
    let totalLatency = 0;
    let latencyCount = 0;

    for (const log of logs) {
      const cost = Number(log.cost);
      byProvider[log.provider] = (byProvider[log.provider] ?? 0) + cost;
      byModel[log.model] = (byModel[log.model] ?? 0) + cost;
      if (log.feature) byFeature[log.feature] = (byFeature[log.feature] ?? 0) + cost;
      if (log.latencyMs) { totalLatency += log.latencyMs; latencyCount++; }
    }

    return {
      totalCost: logs.reduce((s, l) => s + Number(l.cost), 0),
      byProvider, byModel, byFeature,
      totalRequests: logs.length,
      avgLatencyMs: latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0,
    };
  }

  async detectPIILeakage(workspaceId: string): Promise<Array<{
    logId: string; userId: string; provider: string; model: string; detectedAt: Date;
  }>> {
    const logs = await this.usageLogRepo.find({
      where: { workspaceId, piiDetected: true, piiMasked: false },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    return logs.map((log) => ({
      logId: log.id, userId: log.userId,
      provider: log.provider, model: log.model,
      detectedAt: log.createdAt,
    }));
  }

  async getAuditTrail(workspaceId: string, filters?: { userId?: string; action?: AuditAction; flaggedOnly?: boolean }): Promise<AIAuditEntryEntity[]> {
    const where: Record<string, unknown> = { workspaceId };
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.flaggedOnly) where.isFlagged = true;

    return this.auditRepo.find({
      where: where as Partial<AIAuditEntryEntity>,
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
