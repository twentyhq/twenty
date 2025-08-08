import { AgentChatMessagesComponentInstanceContext } from '@/ai/states/agentChatMessagesComponentState';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export type AIChatObjectMetadataAndRecordContext = {
  type: 'objectMetadataId' | 'recordId';
  id: string;
};

export const agentChatObjectMetadataAndRecordContextState =
  createComponentState<Array<AIChatObjectMetadataAndRecordContext>>({
    defaultValue: [],
    key: 'agentChatObjectMetadataAndRecordContextState',
    componentInstanceContext: AgentChatMessagesComponentInstanceContext,
  });
