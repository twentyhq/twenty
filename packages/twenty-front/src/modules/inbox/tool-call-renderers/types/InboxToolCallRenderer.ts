import { type ComponentType } from 'react';
import { type IconComponent } from 'twenty-ui/icon';

import { type InboxItemToolCallDraft } from '@/inbox/contexts/InboxItemPlanContext';
import {
  type InboxItem,
  type InboxItemContextSource,
  type InboxItemToolCall,
} from '~/generated/graphql';

export type InboxToolCallEditorProps = {
  toolCall: InboxItemToolCall;
  source?: InboxItemContextSource;
  onSave: (editedInput: Record<string, unknown>) => Promise<boolean>;
  // An editor that saves on a delay hands the plan a way to land what is still
  // pending before a run reads the row, resolving to whether it did. Null on
  // unmount.
  onRegisterFlush?: (flush: (() => Promise<boolean>) | null) => void;
};

// A surface gets the whole item, not just its call: what it draws may depend
// on what the item is about, the way a reply depends on the thread.
export type InboxToolCallSurfaceProps = {
  toolCall: InboxItemToolCall;
  inboxItem: InboxItem;
  onSave: (editedInput: Record<string, unknown>) => Promise<boolean>;
  onRegisterFlush?: (flush: (() => Promise<boolean>) | null) => void;
};

// A tool that can be started by hand from what an item is about. The subject
// preview knows nothing about it: the slot asks the registry which tools
// start from the subject's object and draws their starters. The proposal is a
// hook because what it proposes is usually read from the subject.
export type InboxToolCallStarter = {
  startsFrom: string[];
  label: () => string;
  Icon: IconComponent;
  useProposal: (inboxItem: InboxItem) => InboxItemToolCallDraft | null;
};

// How a call renders is decided per tool; how it runs is not. A renderer edits
// the call's input and never executes anything itself, so the plan stays the
// one place a call is run from and the actor's permissions stay the ones that
// count. A tool that declares a Surface takes the body of the pane when its
// call is the first one still open; the Editor is what a folded row opens into.
export type InboxToolCallRenderer = {
  Editor: ComponentType<InboxToolCallEditorProps>;
  Surface?: ComponentType<InboxToolCallSurfaceProps>;
  starter?: InboxToolCallStarter;
  // What the primary control reads and shows when this call is the one run.
  runLabel: () => string;
  RunIcon: IconComponent;
};
