import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { type MailgunApiClientService } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/services/mailgun-api-client.service';
import { MailgunDriver } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/services/mailgun-driver.service';
import { type UnsubscribeContentService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-content.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

const emailingDomain = {
  domain: 'news.example.com',
  unsubscribeHostname: 'unsubscribe.news.example.com',
  unsubscribeHostnameStatus: UnsubscribeHostnameStatus.ACTIVE,
} as EmailingDomainEntity;

const notFoundError = new EmailingDomainDriverException(
  'not found',
  EmailingDomainDriverExceptionCode.NOT_FOUND,
);

describe('MailgunDriver', () => {
  let mailgunApiClientService: {
    sendMessage: jest.Mock;
    createDomain: jest.Mock;
    getDomain: jest.Mock;
    verifyDomain: jest.Mock;
    deleteDomain: jest.Mock;
  };
  let unsubscribeContentService: { addTo: jest.Mock };
  let driver: MailgunDriver;

  beforeEach(() => {
    mailgunApiClientService = {
      sendMessage: jest
        .fn()
        .mockResolvedValue({ id: '<message-id-1@news.example.com>' }),
      createDomain: jest.fn(),
      getDomain: jest.fn(),
      verifyDomain: jest.fn(),
      deleteDomain: jest.fn(),
    };
    unsubscribeContentService = {
      addTo: jest.fn().mockImplementation((email) => email),
    };
    driver = new MailgunDriver(
      mailgunApiClientService as unknown as MailgunApiClientService,
      unsubscribeContentService as unknown as UnsubscribeContentService,
    );
  });

  it('should send form-encoded messages with the workspace variable', async () => {
    const result = await driver.sendEmail({
      workspaceId: WORKSPACE_ID,
      domain: 'news.example.com',
      emailingDomain,
      from: 'Newsletter <hello@news.example.com>',
      to: ['recipient@example.com'],
      cc: ['copy@example.com'],
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

    expect(mailgunApiClientService.sendMessage).toHaveBeenCalledTimes(1);

    const [domain, form] = mailgunApiClientService.sendMessage.mock.calls[0];

    expect(domain).toBe('news.example.com');
    expect(form.get('from')).toBe('Newsletter <hello@news.example.com>');
    expect(form.getAll('to')).toEqual(['recipient@example.com']);
    expect(form.getAll('cc')).toEqual(['copy@example.com']);
    expect(form.get('subject')).toBe('Hello');
    expect(form.get('text')).toBe('Hello there');
    expect(form.get('html')).toBe('<p>Hello there</p>');
    expect(form.get('h:Reply-To')).toBe('hello@news.example.com');
    expect(form.get('h:List-Unsubscribe')).toBe('<https://u.example.com/x>');
    expect(form.get('v:workspace_id')).toBe(WORKSPACE_ID);
    expect(form.get('attachment')).toBeInstanceOf(Blob);

    expect(result).toEqual({
      messageId: 'message-id-1@news.example.com',
      deliveredRecipients: {
        to: ['recipient@example.com'],
        cc: ['copy@example.com'],
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

  it('should create the provider domain when verifying a new domain', async () => {
    mailgunApiClientService.getDomain.mockRejectedValueOnce(notFoundError);
    mailgunApiClientService.verifyDomain.mockResolvedValue({
      domain: { name: 'news.example.com', state: 'unverified' },
      sending_dns_records: [
        {
          record_type: 'TXT',
          name: 'news.example.com',
          value: 'v=spf1 include:mailgun.org ~all',
          valid: 'unknown',
        },
      ],
    });

    const result = await driver.verifyDomain({
      domain: 'news.example.com',
      workspaceId: WORKSPACE_ID,
    });

    expect(mailgunApiClientService.createDomain).toHaveBeenCalledWith(
      'news.example.com',
    );
    expect(result.status).toBe(EmailingDomainStatus.PENDING);
    expect(result.verificationRecords).toHaveLength(1);
  });

  it('should reuse an existing provider domain when verifying', async () => {
    mailgunApiClientService.getDomain.mockResolvedValue({
      domain: { name: 'news.example.com', state: 'active' },
    });
    mailgunApiClientService.verifyDomain.mockResolvedValue({
      domain: { name: 'news.example.com', state: 'active' },
      sending_dns_records: [],
    });

    const result = await driver.verifyDomain({
      domain: 'news.example.com',
      workspaceId: WORKSPACE_ID,
    });

    expect(mailgunApiClientService.createDomain).not.toHaveBeenCalled();
    expect(result.status).toBe(EmailingDomainStatus.VERIFIED);
  });

  it('should report missing domains as pending on status checks', async () => {
    mailgunApiClientService.getDomain.mockRejectedValueOnce(notFoundError);

    const result = await driver.getDomainStatus({
      domain: 'unknown.example.com',
      workspaceId: WORKSPACE_ID,
    });

    expect(result).toEqual({
      status: EmailingDomainStatus.PENDING,
      verificationRecords: [],
    });
  });

  it('should tolerate cleaning up missing domains', async () => {
    mailgunApiClientService.deleteDomain.mockRejectedValueOnce(notFoundError);

    await expect(
      driver.cleanupDomain({
        domain: 'unknown.example.com',
        workspaceId: WORKSPACE_ID,
      }),
    ).resolves.toBeUndefined();
  });
});
