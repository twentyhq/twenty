import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageAttachment } from 'src/modules/messaging/message-import-manager/types/message';

export type ComposedEmail = {
  recipients: { to: string[]; cc: string[]; bcc: string[] };
  toRecipientsDisplay: string;
  sanitizedSubject: string;
  plainTextBody: string;
  sanitizedHtmlBody: string;
  attachments: MessageAttachment[];
  connectedAccount: ConnectedAccountWorkspaceEntity;
};
