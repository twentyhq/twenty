import { type ComponentType } from 'react';

import {
  type InboxItemContextSource,
  type InboxItemToolCall,
} from '~/generated/graphql';

export type InboxToolCallEditorProps = {
  toolCall: InboxItemToolCall;
  source?: InboxItemContextSource;
  onSave: (editedInput: Record<string, unknown>) => Promise<void>;
  // An editor that saves on a delay hands the plan a way to land what is still
  // pending before a run reads the row. Null on unmount.
  onRegisterFlush?: (flush: (() => Promise<void>) | null) => void;
};

// How a call renders is decided per tool; how it runs is not. A renderer edits
// the call's input and never executes anything itself, so the plan stays the
// one place a call is run from and the actor's permissions stay the ones that
// count.
export type InboxToolCallRenderer = {
  Editor: ComponentType<InboxToolCallEditorProps>;
  // What the primary control reads when this call is the one being sent.
  runLabel: () => string;
};
