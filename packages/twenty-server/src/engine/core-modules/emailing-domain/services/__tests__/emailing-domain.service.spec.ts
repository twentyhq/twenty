import { EmailingDomainDriverExceptionCode } from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { type EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
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

  const buildEmailContent = () => ({
    from: 'hello@mail.example.com',
    to: ['user@example.com'],
    subject: 'Hi',
    text: 'Body',
  });

  const setUp = (emailingDomain: EmailingDomainEntity) => {
    const sendEmail = jest.fn().mockResolvedValue({ messageId: 'msg-1' });
    const repository = {
      findOne: jest.fn().mockResolvedValue(emailingDomain),
    } as unknown as WorkspaceScopedRepository<EmailingDomainEntity>;
    const factory = {
      getCurrentDriver: () => ({ sendEmail }),
    } as unknown as EmailingDomainDriverFactory;
    const service = new EmailingDomainService(repository, factory);

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
