import { type InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { type InboxItemPayload } from 'src/engine/core-modules/inbox/types/inbox-item-payload.type';

export type InboxSubject =
  | { kind: 'thread'; threadId: string; ownerUserWorkspaceId: string }
  | { kind: 'record'; objectMetadataId: string; recordId: string };

// Who the work is for. A person, or a shared queue that several people watch.
// A producer names one of these; it never resolves the recipient itself.
export type InboxPrincipalRef =
  | { kind: 'userWorkspace'; userWorkspaceId: string }
  | { kind: 'queue'; queueId: string };

export type UpsertInboxItemArgs = {
  workspaceId: string;
  typeKey: string;
  // Omitted on a fold means "keep what the item already says", so a turn that
  // produced no new text cannot blank out a good title or preview.
  title?: string;
  preview?: string;
  payload?: InboxItemPayload | null;
  subject?: InboxSubject;
  // The slot an item occupies for its target. Two upserts naming the same slot
  // are the same piece of work, so the second folds into the first instead of
  // stacking a duplicate. Derived from the subject when omitted, so a producer
  // only names one to fold on something other than the subject.
  slotKey?: string;
  // Producers describe work; they do not choose recipients. This is only read
  // for subjects that carry no owner of their own. When it resolves to nobody,
  // the item lands in the workspace's triage queue rather than being dropped.
  target?: InboxPrincipalRef;
  priority?: InboxItemPriority;
};

// Kept as the name producers call, since routing is what the service does with
// these arguments even though the write itself is an upsert.
export type RouteInboxItemArgs = UpsertInboxItemArgs;
