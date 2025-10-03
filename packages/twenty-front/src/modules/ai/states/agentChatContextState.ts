import { atom } from 'recoil';

export type AIChatObjectMetadataAndRecordContext = {
  type: 'objectMetadataId' | 'recordId';
  id: string;
};

export const agentChatContextState = atom<
  Array<AIChatObjectMetadataAndRecordContext>
>({
  key: 'ai/agentChatContextState',
  default: [],
});
