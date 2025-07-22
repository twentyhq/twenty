import { AgentChatMessagesComponentInstanceContext } from '@/ai/states/agentChatMessagesComponentState';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export type AIChatObjectMetadataAndRecordContext = {
  type: 'objectMetadataId' | 'recordId';
  id: string;
};

export const agentChatObjectMetadataAndRecordContextState =
  createComponentStateV2<Array<AIChatObjectMetadataAndRecordContext>>({
    defaultValue: [],
    key: 'agentChatObjectMetadataAndRecordContextState',
    componentInstanceContext: AgentChatMessagesComponentInstanceContext,
  });
