# AI Governance

AI usage governance with PII masking, model configuration, budget enforcement, prompt templates, audit trail, and unified LLM client (OpenAI/Anthropic/Google).

## Entities
- `AIUsageLogEntity` — userId, provider, model, inputTokens, outputTokens, cost, latencyMs, feature, piiDetected, piiMasked
- `PIIMaskingRuleEntity` — name, category (email/phone/ssn/credit_card), pattern (regex), strategy (redact/hash/replace/tokenize), matchCount
- `ModelConfigEntity` — provider, modelId, isEnabled, maxTokens, temperature, costPerInputToken, costPerOutputToken, monthlyBudget, monthlySpend, allowedFeatures, apiKey
- `PromptTemplateEntity` — name, template, variables, requiredPIIMasking, usageCount
- `AIAuditEntryEntity` — userId, action (prompt/completion/pii_detected/policy_violation), resource, isFlagged

## Service Methods
- `callLLM(workspaceId, userId, options)` — unified LLM call with governance (PII masking, budget check, feature allow-list, audit)
- `maskPII(workspaceId, text)` — applies all active masking rules to text
- `executeWithGovernance(workspaceId, userId, data)` — pre-flight governance check
- `logUsage(workspaceId, data)` — logs usage and updates model spend
- `getUsageCost(workspaceId)` — cost by provider/model/feature
- `detectPIILeakage(workspaceId)` — finds unmasked PII in logs
- `getAuditTrail(workspaceId, filters)` — filtered audit log
- `getModelConfig(workspaceId)` — all model configurations

## Feature Flag
N/A (infrastructure module)

## Dependencies
- LLMClientService (internal)
