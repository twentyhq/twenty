import { ImapFlow } from 'imapflow';
import { simpleParser, AddressObject } from 'mailparser';
import { Logger } from '@nestjs/common';
import { ImapConfig } from './interfaces/imap-config.interface';
import { ImapMessage } from './interfaces/imap-message.interface';

export class ImapDriver {
  private client: ImapFlow;
  private readonly logger = new Logger(ImapDriver.name);

  constructor(private readonly config: ImapConfig) {
    this.client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.tls ?? true,
      auth: {
        user: config.user,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: config.rejectUnauthorized ?? true,
      },
      logger: false, // Disable built-in logger to use NestJS logger
    });
  }

  async connect(timeoutMs = 10000): Promise<void> {
    try {
      const connectPromise = this.client.connect();
      const timeoutPromise = new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out')), timeoutMs),
      );

      await Promise.race([connectPromise, timeoutPromise]);
      this.logger.log('Successfully connected to IMAP server');
    } catch (error) {
      this.logger.error(`Failed to connect to IMAP server: ${error.message}`, error.stack);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.logout();
      this.logger.log('Disconnected from IMAP server');
    } catch (error) {
      this.logger.error(`Error during disconnect: ${error.message}`, error.stack);
    }
  }

  async fetchNewEmails(lastUid: number): Promise<ImapMessage[]> {
    const messages: ImapMessage[] = [];

    try {
      // Wait for mailbox lock
      const lock = await this.client.getMailboxLock('INBOX');

      try {
        // Construct UID range
        // If lastUid is 0, we fetch all messages (1:*)
        // If lastUid > 0, we fetch messages with UID > lastUid (lastUid + 1:*)
        const fetchRange = lastUid > 0 ? `${lastUid + 1}:*` : '1:*';

        // Check if there are any messages to fetch first?
        // imapflow fetch will just return nothing if range is invalid or empty, usually.
        // However, if lastUid is greater than current max UID, it might error or return nothing.
        // But '*' handles dynamic max.

        // We search/fetch directly
        // envelope: true gives us basic info, source: true gives full raw message for parsing
        const msgGenerator = this.client.fetch(fetchRange, { envelope: true, source: true, uid: true });

        for await (const message of msgGenerator) {
          try {
            const parsed = await simpleParser(message.source);

            // Extract From
            let from: string | { name?: string; address?: string } = '';
            if (parsed.from?.value && parsed.from.value.length > 0) {
                from = {
                    name: parsed.from.value[0].name,
                    address: parsed.from.value[0].address,
                };
            }

            // Extract To
            const to: { name?: string; address?: string }[] = [];
            if (parsed.to) {
                if (Array.isArray(parsed.to)) {
                    parsed.to.forEach(addrObj => {
                        to.push(...(addrObj.value || []));
                    });
                } else {
                    to.push(...(parsed.to.value || []));
                }
            }

            // Extract References and In-Reply-To
            let references: string[] = [];
            if (parsed.references) {
              if (Array.isArray(parsed.references)) {
                references = parsed.references as string[];
              } else if (typeof parsed.references === 'string') {
                references = [parsed.references];
              }
            }

            messages.push({
              messageId: parsed.messageId || '',
              uid: message.uid,
              subject: parsed.subject || '',
              from,
              to,
              date: parsed.date || new Date(),
              textBody: parsed.text || '',
              htmlBody: (parsed.html as string) || '',
              hasAttachments: parsed.attachments && parsed.attachments.length > 0,
              inReplyTo: parsed.inReplyTo,
              references,
            });

          } catch (parseError) {
             this.logger.warn(`Failed to parse message UID ${message.uid}: ${parseError.message}`);
             // We continue to next message instead of crashing
          }
        }
      } finally {
        lock.release();
      }
    } catch (error) {
      this.logger.error(`Error fetching emails: ${error.message}`, error.stack);
      // Depending on requirement, we might want to throw or return what we have.
      // Throwing is safer to indicate failure.
      throw error;
    }

    return messages;
  }
}
