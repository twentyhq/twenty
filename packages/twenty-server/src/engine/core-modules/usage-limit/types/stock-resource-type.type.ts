import { type USAGE_LIMIT_DEFINITIONS } from 'src/engine/core-modules/usage-limit/constants/usage-limit-definitions.constant';

type UsageLimitDefinitionsByResourceType = typeof USAGE_LIMIT_DEFINITIONS;

export type StockResourceType = {
  [TResourceType in keyof UsageLimitDefinitionsByResourceType]: 'stock' extends keyof UsageLimitDefinitionsByResourceType[TResourceType]
    ? TResourceType
    : never;
}[keyof UsageLimitDefinitionsByResourceType];
