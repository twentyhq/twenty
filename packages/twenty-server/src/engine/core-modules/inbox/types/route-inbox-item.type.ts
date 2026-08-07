import { type InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { type InboxItemPayload } from 'src/engine/core-modules/inbox/types/inbox-item-payload.type';

export type InboxSubject =
  | { kind: 'thread'; threadId: string; ownerUserWorkspaceId: string }
  | { kind: 'record'; objectMetadataId: string; recordId: string };

export type RouteInboxItemArgs = {
  workspaceId: string;
  typeKey: string;
  // Omitted on a fold means "keep what the item already says", so a turn that
  // produced no new text cannot blank out a good title or preview.
  title?: string;
  preview?: string;
  payload?: InboxItemPayload | null;
  subject?: InboxSubject;
  // Producers describe work; they do not choose recipients. This is only read
  // for subjects that carry no owner of their own.
  fallbackAssigneeUserWorkspaceId?: string;
  priority?: InboxItemPriority;
  dedupeKey?: string;
};
