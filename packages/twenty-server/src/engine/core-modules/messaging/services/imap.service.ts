import { Injectable, Logger } from '@nestjs/common';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { MessageWithParticipants, MessageParticipant } from 'src/modules/messaging/message-import-manager/types/message';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageParticipantRole } from 'twenty-shared/types';
import { ImapDriver } from '../drivers/imap/imap.driver';
import { ImapConfig } from '../drivers/imap/interfaces/imap-config.interface';
import { ImapMessage } from '../drivers/imap/interfaces/imap-message.interface';
import { computeMessageDirection } from 'src/modules/messaging/common/utils/compute-message-direction.util';

@Injectable()
export class ImapService {
  private readonly logger = new Logger(ImapService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messagingSaveService: MessagingSaveMessagesAndEnqueueContactCreationService,
  ) {}

  /**
   * Syncs emails for a given IMAP configuration.
   * This method creates a fresh connection, fetches new emails, and disconnects.
   * 
   * @param config IMAP connection configuration
   * @param lastUid The last known UID. Fetches messages with UID > lastUid.
   * @returns Array of fetched messages
   */
  async syncEmails(config: ImapConfig, lastUid: number): Promise<ImapMessage[]> {
    const driver = new ImapDriver(config);

    try {
      this.logger.log(`Connecting to IMAP server at ${config.host}:${config.port} for user ${config.user}...`);
      await driver.connect();
      
      this.logger.log(`Fetching emails starting from UID ${lastUid + 1}...`);
      const messages = await driver.fetchNewEmails(lastUid);
      
      this.logger.log(`Fetched ${messages.length} new emails.`);
      return messages;

    } catch (error) {
      this.logger.error(`IMAP Sync failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await driver.disconnect();
    }
  }

  /**
   * Syncs messages for a specific connected account and persists them to the database.
   * 
   * @param workspaceId The ID of the workspace
   * @param connectedAccountId The ID of the connected account
   * @param config The IMAP configuration
   */
  async syncMessages(workspaceId: string, connectedAccountId: string, config: ImapConfig): Promise<void> {
     const authContext = buildSystemAuthContext(workspaceId);
     
     const { connectedAccount, messageChannel } = await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
       authContext,
       async () => {
         const connectedAccountRepo = await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
           workspaceId,
           'connectedAccount',
         );
         const messageChannelRepo = await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
           workspaceId,
           'messageChannel',
         );

         const account = await connectedAccountRepo.findOne({ where: { id: connectedAccountId } });
         if (!account) throw new Error(`ConnectedAccount ${connectedAccountId} not found in workspace ${workspaceId}`);

         const channel = await messageChannelRepo.findOne({ where: { connectedAccountId } });
         // If channel doesn't exist, we should probably error or create it, but assuming it exists for sync
         if (!channel) throw new Error(`MessageChannel for account ${connectedAccountId} not found in workspace ${workspaceId}`);

         return { connectedAccount: account, messageChannel: channel };
       }
     );

     // Parse cursor
     let lastUid = 0;
     if (messageChannel.syncCursor) {
       try {
         const cursor = JSON.parse(messageChannel.syncCursor);
         if (typeof cursor.lastUid === 'number') {
           lastUid = cursor.lastUid;
         }
       } catch (e) {
         this.logger.warn(`Failed to parse syncCursor for channel ${messageChannel.id}, starting from 0`);
       }
     }

     // Fetch emails
     const imapMessages = await this.syncEmails(config, lastUid);

     if (imapMessages.length === 0) {
       return;
     }

     // Map to MessageWithParticipants
     const messagesToSave: MessageWithParticipants[] = imapMessages.map(msg => {
        // Determine participants
        const participants: MessageParticipant[] = [];
        
        // From
        if (msg.from) {
            const fromAddr = typeof msg.from === 'string' ? msg.from : msg.from.address;
            const fromName = typeof msg.from === 'string' ? '' : msg.from.name;
            if (fromAddr) {
                participants.push({
                    handle: fromAddr,
                    displayName: fromName || '',
                    role: MessageParticipantRole.FROM,
                });
            }
        }
        
        // To
        msg.to.forEach(to => {
            if (to.address) {
                participants.push({
                    handle: to.address,
                    displayName: to.name || '',
                    role: MessageParticipantRole.TO,
                });
            }
        });

        // Determine Direction
        const fromParticipant = participants.find((p) => p.role === MessageParticipantRole.FROM);
        const direction = fromParticipant 
          ? computeMessageDirection(fromParticipant.handle, connectedAccount) 
          : MessageDirection.INCOMING;

        // Threading
        // Use references[0] as thread ID or fall back to own messageId
        const threadExtId = (msg.references && msg.references.length > 0) 
            ? msg.references[0] 
            : msg.messageId;

        return {
            headerMessageId: msg.messageId,
            subject: msg.subject,
            receivedAt: msg.date,
            text: msg.textBody,
            attachments: [], // TODO: Handle attachments mapping
            externalId: msg.uid.toString(),
            messageThreadExternalId: threadExtId,
            direction,
            participants,
        };
     });

     // Save messages
     await this.messagingSaveService.saveMessagesAndEnqueueContactCreation(
         messagesToSave,
         messageChannel,
         connectedAccount,
         workspaceId
     );

     // Update Cursor
     const maxUid = imapMessages.reduce((max, msg) => (msg.uid > max ? msg.uid : max), 0);
     const newCursor = JSON.stringify({ lastUid: maxUid });

     await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
       authContext,
       async () => {
         const messageChannelRepo = await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
         );
         await messageChannelRepo.update(messageChannel.id, { syncCursor: newCursor, syncedAt: new Date().toISOString() });
       }
     );
  }
}
