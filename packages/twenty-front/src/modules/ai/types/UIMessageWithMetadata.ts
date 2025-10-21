import { type UIMessage } from 'ai';
import { type DataMessagePart } from 'twenty-shared/ai';

type Metadata = {
  createdAt: string;
};

export type UIMessageWithMetadata = UIMessage<Metadata, DataMessagePart>;
