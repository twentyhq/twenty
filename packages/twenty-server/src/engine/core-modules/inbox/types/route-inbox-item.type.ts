import { type InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import {
  type InboxItemContextSource,
  type InboxItemProducer,
} from 'src/engine/core-modules/inbox/types/inbox-item-context.type';
import { type InboxItemRecordDraft } from 'src/engine/core-modules/inbox/types/inbox-item-record-draft.type';
import { type InboxItemToolCallDraft } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-draft.type';

// `ownerUserWorkspaceId` is a property of the subject rather than of its kind:
// a thread knows its owner, a record may or may not.
export type InboxSubject =
  | { kind: 'thread'; threadId: string; ownerUserWorkspaceId: string }
  | {
      kind: 'record';
      objectMetadataId: string;
      recordId: string;
      ownerUserWorkspaceId?: string;
    };

// A producer names one of these; it never resolves the recipient itself.
export type InboxPrincipalRef =
  | { kind: 'userWorkspace'; userWorkspaceId: string }
  | { kind: 'queue'; queueId: string };

export type RouteInboxItemArgs = {
  workspaceId: string;
  typeKey: string;
  // Every producer names itself, so a row can always be traced back to what
  // wrote it and a bad producer is identifiable from the data.
  producer: InboxItemProducer;
  // Omitted on a fold means "keep what the item already says", so a turn that
  // produced no new text cannot blank out a good title or summary.
  title?: string;
  summary?: string;
  source?: InboxItemContextSource;
  // Replaced wholesale on a fold, like the plan: what an item is about is what
  // the latest event says it is about.
  records?: InboxItemRecordDraft[];
  // On a fold these replace whatever the item still proposed, so a producer
  // that plans again does not stack its old plan under the new one.
  toolCalls?: InboxItemToolCallDraft[];
  subject?: InboxSubject;
  // Two upserts naming the same slot are the same piece of work, so the second
  // folds into the first instead of stacking a duplicate. Derived from the
  // subject when omitted.
  slotKey?: string;
  // Only read for subjects that carry no owner of their own. When it resolves
  // to nobody the item lands in triage rather than being dropped.
  target?: InboxPrincipalRef;
  priority?: InboxItemPriority;
};
