import { EmailingDomainDriverExceptionCode } from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { type EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { type EmailingDomainEmailContent } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-content.type';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainSenderService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-sender.service';
import { type MessageSuppressionService } from 'src/engine/core-modules/emailing-domain/services/message-suppression.service';
import { type MessageTopicSubscriptionService } from 'src/engine/core-modules/emailing-domain/services/message-topic-subscription.service';
import { type UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type Repository } from 'typeorm';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

describe('EmailingDomainSenderService.sendEmail', () => {
  const buildEmailingDomain = (
    overrides: Partial<EmailingDomainEntity> = {},
  ): EmailingDomainEntity =>
    ({
      id: 'domain-1',
      workspaceId: 'ws1',
      domain: 'mail.example.com',
      status: EmailingDomainStatus.VERIFIED,
      tenantStatus: EmailingDomainTenantStatus.ACTIVE,
      unsubscribeHostname: 'unsub.mail.example.com',
      unsubscribeHostnameStatus: UnsubscribeHostnameStatus.ACTIVE,
      ...overrides,
    }) as EmailingDomainEntity;

  const buildEmailContent = (
    overrides: Partial<EmailingDomainEmailContent> = {},
  ): EmailingDomainEmailContent => ({
    from: 'hello@mail.example.com',
    to: ['user@example.com'],
    subject: 'Hi',
    text: 'Body',
    ...overrides,
  });

  const setUp = (
    emailingDomain: EmailingDomainEntity,
    suppressedAddresses: string[] = [],
    listUnsubscribedAddresses: string[] = [],
  ) => {
    const sendEmail = jest.fn().mockResolvedValue({ messageId: 'msg-1' });
    const repository = {
      findOne: jest.fn().mockResolvedValue(emailingDomain),
    } as unknown as WorkspaceScopedRepository<EmailingDomainEntity>;
    const factory = {
      getCurrentDriver: () => ({ sendEmail }),
    } as unknown as EmailingDomainDriverFactory;
    const suppressionService = {
      getSuppressedAddresses: jest
        .fn()
        .mockResolvedValue(
          new Set(suppressedAddresses.map((address) => address.toLowerCase())),
        ),
    } as unknown as MessageSuppressionService;
    const subscriptionService = {
      getAddressesUnsubscribedFromList: jest
        .fn()
        .mockResolvedValue(
          new Set(
            listUnsubscribedAddresses.map((address) => address.toLowerCase()),
          ),
        ),
    } as unknown as MessageTopicSubscriptionService;
    const unsubscribeTokenService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    } as unknown as UnsubscribeTokenService;
    const twentyConfigService = {
      get: jest.fn().mockReturnValue(EmailingDomainDriver.AWS_SES),
    } as unknown as TwentyConfigService;
    const messageChannelRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    } as unknown as Repository<MessageChannelEntity>;
    const service = new EmailingDomainSenderService(
      repository,
      factory,
      suppressionService,
      subscriptionService,
      unsubscribeTokenService,
      twentyConfigService,
      messageChannelRepository,
    );

    return { service, sendEmail };
  };

  it('delegates to the driver when the domain is verified and the tenant is active', async () => {
    const { service, sendEmail } = setUp(buildEmailingDomain());

    const result = await service.sendEmail(
      'ws1',
      'domain-1',
      buildEmailContent(),
    );

    expect(result.messageId).toBe('msg-1');
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'ws1',
        domain: 'mail.example.com',
        from: 'hello@mail.example.com',
      }),
    );
  });

  it.each([
    EmailingDomainTenantStatus.PAUSED,
    EmailingDomainTenantStatus.PERMANENTLY_SUSPENDED,
  ])(
    'rejects sending with SENDING_SUSPENDED when tenantStatus is %s, without calling the driver',
    async (tenantStatus) => {
      const { service, sendEmail } = setUp(
        buildEmailingDomain({ tenantStatus }),
      );

      await expect(
        service.sendEmail('ws1', 'domain-1', buildEmailContent()),
      ).rejects.toMatchObject({
        code: EmailingDomainDriverExceptionCode.SENDING_SUSPENDED,
      });
      expect(sendEmail).not.toHaveBeenCalled();
    },
  );

  it('removes suppressed recipients but still sends to deliverable ones', async () => {
    const { service, sendEmail } = setUp(buildEmailingDomain(), [
      'blocked@example.com',
    ]);

    await service.sendEmail(
      'ws1',
      'domain-1',
      buildEmailContent({
        to: ['user@example.com', 'Blocked@example.com'],
        cc: ['blocked@example.com'],
        bcc: ['keep@example.com'],
      }),
    );

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['user@example.com'],
        cc: [],
        bcc: ['keep@example.com'],
      }),
    );
  });

  it('rejects with ALL_RECIPIENTS_SUPPRESSED when every primary recipient is suppressed, without calling the driver', async () => {
    const { service, sendEmail } = setUp(buildEmailingDomain(), [
      'user@example.com',
    ]);

    await expect(
      service.sendEmail('ws1', 'domain-1', buildEmailContent()),
    ).rejects.toMatchObject({
      code: EmailingDomainDriverExceptionCode.ALL_RECIPIENTS_SUPPRESSED,
    });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  // Verification is a precondition for the tenant-status check: a domain that
  // has not been verified should surface a CONFIGURATION_ERROR rather than
  // leaking the tenant pause state to callers who couldn't have used it anyway.
  it('reports the verification failure before the tenant-status failure', async () => {
    const { service } = setUp(
      buildEmailingDomain({
        status: EmailingDomainStatus.PENDING,
        tenantStatus: EmailingDomainTenantStatus.PAUSED,
      }),
    );

    await expect(
      service.sendEmail('ws1', 'domain-1', buildEmailContent()),
    ).rejects.toMatchObject({
      code: EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
    });
  });
});
