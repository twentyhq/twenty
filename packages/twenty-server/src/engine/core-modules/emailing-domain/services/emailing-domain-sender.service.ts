import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { MessageChannelType } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { EMPTY_UNSUBSCRIBE_CONTENT } from 'src/engine/core-modules/emailing-domain/constants/empty-unsubscribe-content.constant';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { type EmailingDomainEmailContent } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-content.type';
import { type EmailingDomainSendEmailInput } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-input.type';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { MessageSuppressionService } from 'src/engine/core-modules/emailing-domain/services/message-suppression.service';
import { MessageTopicSubscriptionService } from 'src/engine/core-modules/emailing-domain/services/message-topic-subscription.service';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type DeliverableRecipients } from 'src/engine/core-modules/emailing-domain/types/deliverable-recipients.type';
import { type UnsubscribeContent } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-content.type';
import { buildUnsubscribeHeaders } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-headers.util';
import { buildUnsubscribeHtmlFooter } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-html-footer.util';
import { buildUnsubscribeTextFooter } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-text-footer.util';
import { buildUnsubscribeUrls } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-urls.util';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class EmailingDomainSenderService {
  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly emailingDomainDriverFactory: EmailingDomainDriverFactory,
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly messageTopicSubscriptionService: MessageTopicSubscriptionService,
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  async sendEmail(
    workspaceId: string,
    emailingDomainId: string,
    emailContent: EmailingDomainEmailContent,
  ): Promise<EmailingDomainSendEmailResult> {
    const emailingDomain = await this.findEmailingDomainByIdOrThrow(
      workspaceId,
      emailingDomainId,
    );

    this.assertDomainCanSend(emailingDomain, emailContent.from);

    const recipients = await this.selectDeliverableRecipients(
      workspaceId,
      emailingDomain,
      emailContent,
    );

    const unsubscribe = this.buildUnsubscribeContent(
      workspaceId,
      emailingDomain,
      recipients.to[0],
      emailContent.messageTopicId,
    );

    const replyTo = await this.resolveReplyTo(workspaceId, emailContent);

    const emailToSend = {
      workspaceId,
      domain: emailingDomain.domain,
      from: emailContent.from,
      replyTo,
      to: recipients.to,
      cc: recipients.cc,
      bcc: recipients.bcc,
      subject: emailContent.subject,
      text: `${emailContent.text}${unsubscribe.textFooter}`,
      html: isNonEmptyString(emailContent.html)
        ? `${emailContent.html}${unsubscribe.htmlFooter}`
        : emailContent.html,
      attachments: emailContent.attachments,
      headers: [...(emailContent.headers ?? []), ...unsubscribe.headers],
    } as EmailingDomainSendEmailInput;

    return this.emailingDomainDriverFactory
      .getCurrentDriver()
      .sendEmail(emailToSend);
  }

  private async resolveReplyTo(
    workspaceId: string,
    emailContent: EmailingDomainEmailContent,
  ): Promise<string[] | undefined> {
    if (isDefined(emailContent.replyTo) && emailContent.replyTo.length > 0) {
      return emailContent.replyTo;
    }

    const emailGroupChannel = await this.messageChannelRepository.findOne({
      where: {
        workspaceId,
        type: MessageChannelType.EMAIL_GROUP,
        connectedAccount: { handle: emailContent.from },
      },
      relations: { connectedAccount: true },
    });

    const forwardingAddress = emailGroupChannel?.handle;

    return isNonEmptyString(forwardingAddress)
      ? [forwardingAddress]
      : undefined;
  }

  private async findEmailingDomainByIdOrThrow(
    workspaceId: string,
    emailingDomainId: string,
  ): Promise<EmailingDomainEntity> {
    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      { where: { id: emailingDomainId } },
    );

    if (!isDefined(emailingDomain)) {
      throw new EmailingDomainDriverException(
        'Emailing domain not found',
        EmailingDomainDriverExceptionCode.NOT_FOUND,
      );
    }

    return emailingDomain;
  }

  private assertDomainCanSend(
    emailingDomain: EmailingDomainEntity,
    fromAddress: string,
  ): void {
    if (emailingDomain.status !== EmailingDomainStatus.VERIFIED) {
      throw new EmailingDomainDriverException(
        `Emailing domain is not verified (status: ${emailingDomain.status})`,
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    if (emailingDomain.tenantStatus !== EmailingDomainTenantStatus.ACTIVE) {
      throw new EmailingDomainDriverException(
        `Sending is suspended for emailing domain ${emailingDomain.domain} (tenantStatus: ${emailingDomain.tenantStatus})`,
        EmailingDomainDriverExceptionCode.SENDING_SUSPENDED,
      );
    }

    const fromAddressDomain = getDomainFromEmail(fromAddress)?.toLowerCase();

    if (fromAddressDomain !== emailingDomain.domain.toLowerCase()) {
      throw new EmailingDomainDriverException(
        `From address ${fromAddress} does not match verified domain ${emailingDomain.domain}`,
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }
  }

  private async selectDeliverableRecipients(
    workspaceId: string,
    emailingDomain: EmailingDomainEntity,
    emailContent: EmailingDomainEmailContent,
  ): Promise<DeliverableRecipients> {
    const allRecipients = [
      ...emailContent.to,
      ...(emailContent.cc ?? []),
      ...(emailContent.bcc ?? []),
    ];

    const suppressedAddresses =
      await this.messageSuppressionService.getSuppressedAddresses(
        workspaceId,
        allRecipients,
      );

    const listUnsubscribedAddresses = await this.getListUnsubscribedAddresses(
      workspaceId,
      allRecipients,
      emailContent.messageTopicId,
    );

    const isDeliverable = (address: string): boolean => {
      const normalizedAddress = address.trim().toLowerCase();

      return (
        !suppressedAddresses.has(normalizedAddress) &&
        !listUnsubscribedAddresses.has(normalizedAddress)
      );
    };

    const to = emailContent.to.filter(isDeliverable);

    if (to.length === 0) {
      throw new EmailingDomainDriverException(
        `All primary recipients are suppressed for emailing domain ${emailingDomain.domain}`,
        EmailingDomainDriverExceptionCode.ALL_RECIPIENTS_SUPPRESSED,
      );
    }

    return {
      to,
      cc: emailContent.cc?.filter(isDeliverable),
      bcc: emailContent.bcc?.filter(isDeliverable),
    };
  }

  private async getListUnsubscribedAddresses(
    workspaceId: string,
    recipients: string[],
    messageTopicId: string | undefined,
  ): Promise<Set<string>> {
    if (!isNonEmptyString(messageTopicId)) {
      return new Set();
    }

    return this.messageTopicSubscriptionService.getAddressesUnsubscribedFromList(
      workspaceId,
      recipients,
      messageTopicId,
    );
  }

  private buildUnsubscribeContent(
    workspaceId: string,
    emailingDomain: EmailingDomainEntity,
    primaryRecipient: string,
    messageTopicId: string | undefined,
  ): UnsubscribeContent {
    // The LOG driver fakes delivery and provisions no unsubscribe hostname, so
    // demo sends carry no unsubscribe content (and aren't gated on it).
    const isDemoMode =
      this.twentyConfigService.get('EMAILING_DOMAIN_DRIVER') ===
      EmailingDomainDriver.LOG;

    if (isDemoMode) {
      return EMPTY_UNSUBSCRIBE_CONTENT;
    }

    if (
      emailingDomain.unsubscribeHostnameStatus !==
        UnsubscribeHostnameStatus.ACTIVE ||
      !isNonEmptyString(emailingDomain.unsubscribeHostname)
    ) {
      throw new EmailingDomainDriverException(
        `Cannot send email for ${emailingDomain.domain}: unsubscribe domain is not active (status: ${emailingDomain.unsubscribeHostnameStatus})`,
        EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY,
      );
    }

    const token = this.unsubscribeTokenService.sign({
      workspaceId,
      emailAddress: primaryRecipient,
      ...(isNonEmptyString(messageTopicId) ? { messageTopicId } : {}),
    });

    const unsubscribeUrls = buildUnsubscribeUrls({
      unsubscribeHostname: emailingDomain.unsubscribeHostname,
      domain: emailingDomain.domain,
      token,
    });

    return {
      headers: buildUnsubscribeHeaders(unsubscribeUrls),
      textFooter: buildUnsubscribeTextFooter(unsubscribeUrls.httpsUrl),
      htmlFooter: buildUnsubscribeHtmlFooter(unsubscribeUrls.httpsUrl),
    };
  }
}
