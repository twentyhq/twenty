import { type AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { AwsSesDriver } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-driver.service';
import { type AwsSesHandleErrorService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import { type AwsSesRegisterDomainService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-register-domain.service';
import { type AwsSesSendEmailService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-send-email.service';
import { type AwsSesDriverConfig } from 'src/engine/core-modules/emailing-domain/drivers/interfaces/driver-config.interface';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { type UnsubscribeContentService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-content.service';

describe('AwsSesDriver getDomainStatus', () => {
  const config: AwsSesDriverConfig = {
    driver: EmailingDomainDriver.AWS_SES,
    region: 'us-east-1',
    accountId: '123456789012',
  };

  const setUp = (identityResponse: Record<string, unknown>) => {
    const send = jest.fn().mockResolvedValue(identityResponse);
    const clientProvider = {
      getSESClient: () => ({ send }),
    } as unknown as AwsSesClientProvider;

    const driver = new AwsSesDriver(
      config,
      clientProvider,
      {} as unknown as AwsSesHandleErrorService,
      {} as unknown as AwsSesRegisterDomainService,
      {} as unknown as AwsSesSendEmailService,
      {} as unknown as UnsubscribeContentService,
    );

    return driver.getDomainStatus({
      domain: 'twenty.dev',
      workspaceId: 'workspace-id',
    });
  };

  it('should report pending while SES is still waiting for the DKIM records', async () => {
    const result = await setUp({
      VerifiedForSendingStatus: false,
      DkimAttributes: { SigningEnabled: true, Status: 'PENDING', Tokens: [] },
    });

    expect(result.status).toBe(EmailingDomainStatus.PENDING);
  });

  it('should report pending when a DKIM check fails temporarily', async () => {
    const result = await setUp({
      VerifiedForSendingStatus: false,
      DkimAttributes: {
        SigningEnabled: true,
        Status: 'TEMPORARY_FAILURE',
        Tokens: [],
      },
    });

    expect(result.status).toBe(EmailingDomainStatus.PENDING);
  });

  it('should report failed when SES gave up on the DKIM records', async () => {
    const result = await setUp({
      VerifiedForSendingStatus: false,
      DkimAttributes: { SigningEnabled: true, Status: 'FAILED', Tokens: [] },
    });

    expect(result.status).toBe(EmailingDomainStatus.FAILED);
  });

  it('should report verified once SES signs with DKIM', async () => {
    const result = await setUp({
      VerifiedForSendingStatus: true,
      DkimAttributes: { SigningEnabled: true, Status: 'SUCCESS', Tokens: [] },
    });

    expect(result.status).toBe(EmailingDomainStatus.VERIFIED);
  });

  it('should mark every DKIM record pending while the domain is pending', async () => {
    const result = await setUp({
      VerifiedForSendingStatus: false,
      DkimAttributes: {
        SigningEnabled: true,
        Status: 'PENDING',
        Tokens: ['token1', 'token2', 'token3'],
      },
    });

    expect(result.verificationRecords).toHaveLength(3);
    expect(
      result.verificationRecords.every((record) => record.status === 'pending'),
    ).toBe(true);
  });
});
