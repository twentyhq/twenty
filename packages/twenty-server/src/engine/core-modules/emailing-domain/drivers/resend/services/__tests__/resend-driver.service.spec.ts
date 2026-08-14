import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { type ResendApiClientService } from 'src/engine/core-modules/emailing-domain/drivers/resend/services/resend-api-client.service';
import { ResendDriver } from 'src/engine/core-modules/emailing-domain/drivers/resend/services/resend-driver.service';
import { type UnsubscribeContentService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-content.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

const emailingDomain = {
  domain: 'news.example.com',
  unsubscribeHostname: 'unsubscribe.news.example.com',
  unsubscribeHostnameStatus: UnsubscribeHostnameStatus.ACTIVE,
} as EmailingDomainEntity;

describe('ResendDriver', () => {
  let resendApiClientService: {
    sendEmail: jest.Mock;
    createDomain: jest.Mock;
    getDomain: jest.Mock;
    listDomains: jest.Mock;
    verifyDomain: jest.Mock;
    deleteDomain: jest.Mock;
  };
  let unsubscribeContentService: { addTo: jest.Mock };
  let driver: ResendDriver;

  beforeEach(() => {
    resendApiClientService = {
      sendEmail: jest.fn().mockResolvedValue({ id: 'resend-email-id' }),
      createDomain: jest.fn(),
      getDomain: jest.fn(),
      listDomains: jest.fn().mockResolvedValue({ data: [] }),
      verifyDomain: jest.fn(),
      deleteDomain: jest.fn(),
    };
    unsubscribeContentService = {
      addTo: jest.fn().mockImplementation((email) => email),
    };
    driver = new ResendDriver(
      { driver: EmailingDomainDriver.RESEND },
      resendApiClientService as unknown as ResendApiClientService,
      unsubscribeContentService as unknown as UnsubscribeContentService,
    );
  });

  it('should send emails with the workspace attribution tag', async () => {
    const result = await driver.sendEmail({
      workspaceId: WORKSPACE_ID,
      domain: 'news.example.com',
      emailingDomain,
      from: 'Newsletter <hello@news.example.com>',
      to: ['recipient@example.com'],
      subject: 'Hello',
      text: 'Hello there',
      html: '<p>Hello there</p>',
      replyTo: ['hello@news.example.com'],
      headers: [
        { name: 'List-Unsubscribe', value: '<https://u.example.com/x>' },
      ],
      attachments: [
        {
          filename: 'brochure.pdf',
          content: Buffer.from('pdf-bytes'),
          contentType: 'application/pdf',
        },
      ],
    });

    expect(resendApiClientService.sendEmail).toHaveBeenCalledWith({
      from: 'Newsletter <hello@news.example.com>',
      to: ['recipient@example.com'],
      cc: undefined,
      bcc: undefined,
      reply_to: ['hello@news.example.com'],
      subject: 'Hello',
      text: 'Hello there',
      html: '<p>Hello there</p>',
      headers: { 'List-Unsubscribe': '<https://u.example.com/x>' },
      tags: [{ name: 'workspace_id', value: WORKSPACE_ID }],
      attachments: [
        {
          filename: 'brochure.pdf',
          content: Buffer.from('pdf-bytes').toString('base64'),
          content_type: 'application/pdf',
        },
      ],
    });
    expect(result).toEqual({
      messageId: 'resend-email-id',
      deliveredRecipients: {
        to: ['recipient@example.com'],
        cc: [],
        bcc: [],
      },
    });
  });

  it('should refuse to send when the unsubscribe hostname is not active', async () => {
    await expect(
      driver.sendEmail({
        workspaceId: WORKSPACE_ID,
        domain: 'news.example.com',
        emailingDomain: {
          ...emailingDomain,
          unsubscribeHostnameStatus: UnsubscribeHostnameStatus.PENDING,
        } as EmailingDomainEntity,
        from: 'hello@news.example.com',
        to: ['recipient@example.com'],
        subject: 'Hello',
        text: 'Hello there',
      }),
    ).rejects.toThrow('unsubscribe domain is not active');
  });

  it('should reuse an existing provider domain when verifying', async () => {
    resendApiClientService.listDomains.mockResolvedValue({
      data: [{ id: 'domain-id', name: 'News.Example.com', status: 'pending' }],
    });
    resendApiClientService.getDomain.mockResolvedValue({
      id: 'domain-id',
      name: 'news.example.com',
      status: 'verified',
      records: [],
    });

    const result = await driver.verifyDomain({
      domain: 'news.example.com',
      workspaceId: WORKSPACE_ID,
    });

    expect(resendApiClientService.createDomain).not.toHaveBeenCalled();
    expect(resendApiClientService.verifyDomain).toHaveBeenCalledWith(
      'domain-id',
    );
    expect(result.status).toBe(EmailingDomainStatus.VERIFIED);
  });

  it('should create the provider domain when verifying a new domain', async () => {
    resendApiClientService.createDomain.mockResolvedValue({
      id: 'domain-id',
      name: 'news.example.com',
      status: 'not_started',
    });
    resendApiClientService.getDomain.mockResolvedValue({
      id: 'domain-id',
      name: 'news.example.com',
      status: 'not_started',
      records: [
        {
          record: 'DKIM',
          name: 'resend._domainkey.news.example.com',
          type: 'TXT',
          value: 'p=abc',
          status: 'not_started',
        },
      ],
    });

    const result = await driver.verifyDomain({
      domain: 'news.example.com',
      workspaceId: WORKSPACE_ID,
    });

    expect(resendApiClientService.createDomain).toHaveBeenCalledWith({
      name: 'news.example.com',
    });
    expect(result.status).toBe(EmailingDomainStatus.PENDING);
    expect(result.verificationRecords).toHaveLength(1);
  });

  it('should report missing domains as failed on status checks', async () => {
    const result = await driver.getDomainStatus({
      domain: 'unknown.example.com',
      workspaceId: WORKSPACE_ID,
    });

    expect(result).toEqual({
      status: EmailingDomainStatus.FAILED,
      verificationRecords: [],
    });
  });
});
