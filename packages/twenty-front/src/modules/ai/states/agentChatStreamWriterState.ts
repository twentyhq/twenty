import { type UIMessageChunk } from 'ai';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const agentChatStreamWriterState =
  createAtomState<WritableStreamDefaultWriter<UIMessageChunk> | null>({
    key: 'agentChatStreamWriterState',
    defaultValue: null,
  });
