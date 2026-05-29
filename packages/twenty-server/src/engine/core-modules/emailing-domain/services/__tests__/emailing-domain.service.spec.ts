import { EmailingDomainDriverExceptionCode } from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { type EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { type EmailingDomainEmailContent } from 'src/engine/core-modules/emailing-domain/drivers/types/send-email';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { type EmailGroupSuppressionService } from 'src/engine/core-modules/emailing-domain/services/email-group-suppression.service';
import { type EmailGroupUnsubscribeService } from 'src/engine/core-modules/emailing-domain/services/email-group-unsubscribe.service';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
import { type BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

describe('EmailingDomainService.sendEmail', () => {
  const buildEmailingDomain = (
    overrides: Partial<EmailingDomainEntity> = {},
  ): EmailingDomainEntity =>
    ({
      id: 'domain-1',
      workspaceId: 'ws1',
      domain: 'mail.example.com',
      status: EmailingDomainStatus.VERIFIED,
      tenantStatus: EmailingDomainTenantStatus.ACTIVE,
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
    } as unknown as EmailGroupSuppressionService;
    const unsubscribeService = {
      buildUnsubscribeHeaders: jest
        .fn()
        .mockReturnValue([
          { name: 'List-Unsubscribe', value: '<https://app/unsubscribe>' },
        ]),
    } as unknown as EmailGroupUnsubscribeService;
    const throttlerService = {
      tokenBucketThrottleOrThrow: jest.fn().mockResolvedValue(1),
    } as unknown as ThrottlerService;
    const billingUsageService = {
      canFeatureBeUsed: jest.fn().mockResolvedValue(true),
    } as unknown as BillingUsageService;
    const workspaceEventEmitter = {
      emitCustomBatchEvent: jest.fn(),
    } as unknown as WorkspaceEventEmitter;
    const service = new EmailingDomainService(
      repository,
      factory,
      suppressionService,
      unsubscribeService,
      throttlerService,
      billingUsageService,
      workspaceEventEmitter,
    );

    return {
      service,
      sendEmail,
      unsubscribeService,
      throttlerService,
      billingUsageService,
      workspaceEventEmitter,
    };
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

  it('attaches one-click unsubscribe headers for a single-recipient marketing send', async () => {
    const { service, sendEmail } = setUp(buildEmailingDomain());

    await service.sendEmail(
      'ws1',
      'domain-1',
      buildEmailContent({ includeUnsubscribe: true }),
    );

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: [
          { name: 'List-Unsubscribe', value: '<https://app/unsubscribe>' },
        ],
      }),
    );
  });

  it('omits unsubscribe headers when the message has multiple recipients', async () => {
    const { service, sendEmail, unsubscribeService } = setUp(
      buildEmailingDomain(),
    );

    await service.sendEmail(
      'ws1',
      'domain-1',
      buildEmailContent({
        includeUnsubscribe: true,
        cc: ['second@example.com'],
      }),
    );

    expect(unsubscribeService.buildUnsubscribeHeaders).not.toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ headers: undefined }),
    );
  });

  it('blocks provisioning a new emailing domain when the billing plan disallows the feature', async () => {
    const { service, billingUsageService } = setUp(buildEmailingDomain());

    (billingUsageService.canFeatureBeUsed as jest.Mock).mockResolvedValue(
      false,
    );

    await expect(
      service.createEmailingDomain(
        'mail.example.com',
        EmailingDomainDriver.AWS_SES,
        {
          id: 'ws1',
        } as WorkspaceEntity,
      ),
    ).rejects.toMatchObject({
      code: EmailingDomainDriverExceptionCode.SENDING_SUSPENDED,
    });
  });

  it('meters one usage event per accepted recipient at the marked-up per-recipient cost', async () => {
    const { service, workspaceEventEmitter } = setUp(buildEmailingDomain());

    await service.sendEmail(
      'ws1',
      'domain-1',
      buildEmailContent({ to: ['a@example.com', 'b@example.com'] }),
    );

    expect(workspaceEventEmitter.emitCustomBatchEvent).toHaveBeenCalledWith(
      'USAGE_RECORDED',
      [
        expect.objectContaining({
          operationType: UsageOperationType.EMAIL_SEND,
          quantity: 2,
          creditsUsedMicro: 600,
        }),
      ],
      'ws1',
    );
  });

  it('rejects sending when the billing plan disallows it, without calling the driver or metering', async () => {
    const { service, sendEmail, billingUsageService, workspaceEventEmitter } =
      setUp(buildEmailingDomain());

    (billingUsageService.canFeatureBeUsed as jest.Mock).mockResolvedValue(
      false,
    );

    await expect(
      service.sendEmail('ws1', 'domain-1', buildEmailContent()),
    ).rejects.toMatchObject({
      code: EmailingDomainDriverExceptionCode.SENDING_SUSPENDED,
    });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(workspaceEventEmitter.emitCustomBatchEvent).not.toHaveBeenCalled();
  });

  it('consumes one rate-limit token per deliverable recipient before sending', async () => {
    const { service, throttlerService } = setUp(buildEmailingDomain());

    await service.sendEmail(
      'ws1',
      'domain-1',
      buildEmailContent({ to: ['a@example.com'], cc: ['c@example.com'] }),
    );

    expect(throttlerService.tokenBucketThrottleOrThrow).toHaveBeenCalledWith(
      'emailing-domain-send:ws1',
      2,
      expect.any(Number),
      expect.any(Number),
    );
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
