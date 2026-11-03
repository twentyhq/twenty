import { type AgentChatThreadRowMetadata } from 'twenty-shared/ai';

import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatThreadRowMetadataFamilyState = createAtomFamilyState<
  AgentChatThreadRowMetadata | null,
  string
>({
  key: 'agentChatThreadRowMetadataFamilyState',
  defaultValue: null,
});
