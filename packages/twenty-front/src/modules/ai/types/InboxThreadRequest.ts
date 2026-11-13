import { type ReactNode } from 'react';

export type InboxThreadRequest =
  | {
      type: 'choices';
      choices: { id: string; label: string; avatar?: ReactNode }[];
      onChoose: (choiceId: string) => void;
    }
  | { type: 'review'; label: string; onReview: () => void }
  | { type: 'reply'; onReply: () => void };
