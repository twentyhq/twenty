import { type UIMessage } from 'ai';

export type UIMessageWithMetadata = UIMessage & {
  metadata: {
    createdAt: string;
  };
};
