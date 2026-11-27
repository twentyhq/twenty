import { type InboxObjectNamesByLegacyName } from 'twenty-shared/ai';

export type InboxNamesByLegacyName = InboxObjectNamesByLegacyName & {
  relationFields: {
    agentChatThreadTargets: string;
  };
};
