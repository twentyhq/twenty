import { type InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { type InboxItemContext } from 'src/engine/core-modules/inbox/types/inbox-item-context.type';
import { type InboxItemToolCallDraft } from 'src/engine/core-modules/inbox/types/inbox-item-tool-call-draft.type';

// What the work is about. `ownerUserWorkspaceId` is the subject saying who it
// belongs to, which is a property of the subject rather than of its kind: a
// thread knows its owner, a record may or may not.
export type InboxSubject =
  | { kind: 'thread'; threadId: string; ownerUserWorkspaceId: string }
  | {
      kind: 'record';
      objectMetadataId: string;
      recordId: string;
      ownerUserWorkspaceId?: string;
    };

// Who the work is for. A person, or a shared queue that several people watch.
// A producer names one of these; it never resolves the recipient itself.
export type InboxPrincipalRef =
  | { kind: 'userWorkspace'; userWorkspaceId: string }
  | { kind: 'queue'; queueId: string };

// A producer describes an item as a context and the calls it proposes, and
// says nothing about how it is shown or acted on: every item gets the same
// controls.
export type RouteInboxItemArgs = {
  workspaceId: string;
  typeKey: string;
  // Omitted on a fold means "keep what the item already says", so a turn that
  // produced no new text cannot blank out a good title or context.
  title?: string;
  context?: InboxItemContext;
  // On a fold these replace whatever the item still proposed, so a producer
  // that plans again does not stack its old plan under the new one.
  toolCalls?: InboxItemToolCallDraft[];
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
