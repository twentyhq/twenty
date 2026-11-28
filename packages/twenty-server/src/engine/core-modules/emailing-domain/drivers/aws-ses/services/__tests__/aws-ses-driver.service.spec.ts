import { VerifyDomainDkimCommand } from '@aws-sdk/client-ses';
import {
  GetEmailIdentityCommand,
  NotFoundException,
} from '@aws-sdk/client-sesv2';

import { type AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { type AwsSesAccountService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-account.service';
import { AwsSesDriver } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-driver.service';
import { AwsSesHandleErrorService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import { type AwsSesRegisterDomainService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-register-domain.service';
import { type AwsSesSendEmailService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-send-email.service';
import { EmailingDomainDriverExceptionCode } from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { type UnsubscribeContentService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-content.service';

describe('AwsSesDriver.retryVerification', () => {
  const input = { domain: 'example.com', workspaceId: 'workspace-id' };
  const tokens = ['first-token', 'second-token', 'third-token'];
  const send = jest.fn();
  const sendLegacy = jest.fn();
  const getLegacyClient = jest.fn(() => ({ send: sendLegacy }));
  const driver = new AwsSesDriver(
    {
      driver: EmailingDomainDriver.AWS_SES,
      region: 'eu-central-1',
      accountId: '123456789012',
    },
    {
      getSESClient: () => ({ send }),
      getSESv1Client: getLegacyClient,
    } as unknown as AwsSesClientProvider,
    {
      getAccountState: jest.fn().mockResolvedValue({
        isProductionAccessEnabled: true,
      }),
    } as unknown as AwsSesAccountService,
    new AwsSesHandleErrorService(),
    {} as AwsSesRegisterDomainService,
    {} as AwsSesSendEmailService,
    {} as UnsubscribeContentService,
  );

  beforeEach(() => {
    send.mockReset();
    sendLegacy.mockReset().mockResolvedValue({ DkimTokens: tokens });
    getLegacyClient.mockClear();
  });

  it('restarts failed Easy DKIM verification without changing signing attributes', async () => {
    send.mockResolvedValue({
      DkimAttributes: {
        Status: 'FAILED',
        SigningAttributesOrigin: 'AWS_SES',
        CurrentSigningKeyLength: 'RSA_2048_BIT',
        NextSigningKeyLength: 'RSA_2048_BIT',
        Tokens: tokens,
      },
    });

    await driver.retryVerification(input);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toBeInstanceOf(GetEmailIdentityCommand);
    expect(send.mock.calls[0][0].input).toEqual({
      EmailIdentity: input.domain,
    });
    expect(sendLegacy).toHaveBeenCalledTimes(1);
    expect(sendLegacy.mock.calls[0][0]).toBeInstanceOf(VerifyDomainDkimCommand);
    expect(sendLegacy.mock.calls[0][0].input).toEqual({ Domain: input.domain });
  });

  it.each([
    'SUCCESS',
    'PENDING',
    'NOT_STARTED',
    'TEMPORARY_FAILURE',
    undefined,
  ])('does not restart verification when SES reports %s', async (status) => {
    send.mockResolvedValue({ DkimAttributes: { Status: status } });

    await driver.retryVerification(input);

    expect(getLegacyClient).not.toHaveBeenCalled();
  });

  it('allows a previously failed domain to become verified when SES already succeeded', async () => {
    send.mockResolvedValue({
      Tags: [{ Key: 'Tenant', Value: 'twenty-workspace-workspace-id' }],
      VerifiedForSendingStatus: true,
      DkimAttributes: {
        Status: 'SUCCESS',
        SigningEnabled: true,
        Tokens: tokens,
      },
    });

    await driver.retryVerification(input);
    const result = await driver.verifyDomain(input);

    expect(result.status).toBe(EmailingDomainStatus.VERIFIED);
    expect(getLegacyClient).not.toHaveBeenCalled();
  });

  it('does not create an identity when the identity no longer exists', async () => {
    send.mockRejectedValue(
      new NotFoundException({ message: 'Identity not found', $metadata: {} }),
    );

    await expect(driver.retryVerification(input)).resolves.toBeUndefined();

    expect(getLegacyClient).not.toHaveBeenCalled();
  });

  it.each(['read', 'retry'])(
    'reports an AWS permission error during %s',
    async (operation) => {
      const error = Object.assign(new Error('Access denied'), {
        name: 'AccessDeniedException',
      });

      if (operation === 'read') {
        send.mockRejectedValue(error);
      } else {
        send.mockResolvedValue({ DkimAttributes: { Status: 'FAILED' } });
        sendLegacy.mockRejectedValue(error);
      }

      await expect(driver.retryVerification(input)).rejects.toMatchObject({
        code: EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      });
    },
  );
});
