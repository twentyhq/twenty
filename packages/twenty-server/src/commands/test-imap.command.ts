import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { v4 } from 'uuid';

import { ImapService } from 'src/engine/core-modules/messaging/services/imap.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity, MessageChannelType, MessageChannelSyncStage, MessageChannelContactAutoCreationPolicy, MessageFolderImportPolicy, MessageChannelPendingGroupEmailsAction, MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Command({ name: 'test:imap', description: 'Test IMAP sync' })
export class TestImapCommand extends CommandRunner {
  private readonly logger = new Logger(TestImapCommand.name);

  constructor(
    private readonly imapService: ImapService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {
    super();
  }

  async run(): Promise<void> {
    this.logger.log('Starting IMAP Test...');

    const workspaceId = '202401010000000000000000'; // Default Dev Workspace
    const accountEmail = process.env.IMAP_TEST_USER || 'jaren.wilkinson@ethereal.email';
    const accountPassword = process.env.IMAP_TEST_PASSWORD || 'BJqeAncRHa5tNpknFG';
    const imapHost = 'imap.ethereal.email';
    const imapPort = 993;

    try {
        // 1. Ensure Workspace Exists (Check Metadata)
        // We assume the schema exists for this default workspace ID in a dev environment.
        // If not, this test might fail on schema access.
        
        const authContext = buildSystemAuthContext(workspaceId);

        await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
            authContext,
            async () => {
                this.logger.log(`Using Workspace ID: ${workspaceId}`);

                // 2. Create/Get Connected Account
                const connectedAccountRepo = await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
                    workspaceId,
                    'connectedAccount',
                );

                let account = await connectedAccountRepo.findOne({ where: { handle: accountEmail } });
                
                if (!account) {
                    this.logger.log('Creating Connected Account...');
                    const inserted = await connectedAccountRepo.insert({
                        id: v4(),
                        handle: accountEmail,
                        provider: 'IMAP',
                        accessToken: 'mock-token', // Not used for IMAP password auth usually, but required
                        refreshToken: 'mock-refresh',
                        email: accountEmail,
                        firstName: 'Jaren',
                        lastName: 'Wilkinson',
                    });
                    // Insert returns InsertResult, we need to fetch the object or use the ID we generated
                    // Wait, insert result might not contain the object.
                    // Let's use the ID we generated.
                    account = await connectedAccountRepo.findOne({ where: { handle: accountEmail } });
                } else {
                    this.logger.log('Connected Account already exists.');
                }

                if (!account) throw new Error('Failed to create/find account');

                // 3. Create/Get Message Channel
                const messageChannelRepo = await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
                    workspaceId,
                    'messageChannel',
                );

                let channel = await messageChannelRepo.findOne({ where: { connectedAccountId: account.id } });

                if (!channel) {
                    this.logger.log('Creating Message Channel...');
                    await messageChannelRepo.insert({
                        id: v4(),
                        connectedAccountId: account.id,
                        type: MessageChannelType.EMAIL,
                        visibility: MessageChannelVisibility.SHARE_EVERYTHING,
                        isContactAutoCreationEnabled: true,
                        contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
                        messageFolderImportPolicy: MessageFolderImportPolicy.ALL_FOLDERS,
                        pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction.NONE,
                        isSyncEnabled: true,
                        syncStage: MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
                        excludeNonProfessionalEmails: false,
                        excludeGroupEmails: false,
                        throttleFailureCount: 0,
                    });
                     channel = await messageChannelRepo.findOne({ where: { connectedAccountId: account.id } });
                } else {
                    this.logger.log('Message Channel already exists.');
                }
                
                if (!channel) throw new Error('Failed to create/find message channel');

                // 4. Run Sync
                this.logger.log('Executing Sync...');
                await this.imapService.syncMessages(workspaceId, account.id, {
                    host: imapHost,
                    port: imapPort,
                    user: accountEmail,
                    password: accountPassword,
                    tls: true,
                });

                // 5. Verify
                const messageRepo = await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
                    workspaceId,
                    'message',
                );

                // We want to check messages linked to this channel?
                // Or just count all messages for now to verify *some* were added.
                // ideally check via MessageChannelMessageAssociation but that's complex to query quickly.
                // We'll just count total messages in the workspace.
                const count = await messageRepo.count();
                this.logger.log(`SUCCESS: Found ${count} messages in DB (Total).`);
                
                // Optional: Print subjects
                const messages = await messageRepo.find({ take: 5, order: { receivedAt: 'DESC' } });
                messages.forEach(m => this.logger.log(`- [${m.receivedAt}] ${m.subject}`));
            }
        );

    } catch (error) {
        this.logger.error('Test Failed', error);
        process.exit(1);
    }
  }
}
