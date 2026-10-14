import { type AgentManifest } from 'twenty-shared/application';

import { type WithTranslatableProperties } from '@/sdk/define/common/types/translatable-text.type';

export type TranslatableAgentConfig = WithTranslatableProperties<
  AgentManifest,
  'label' | 'description'
>;
