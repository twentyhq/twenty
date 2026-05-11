import {
  CreateConfigurationSetCommand,
  CreateConfigurationSetEventDestinationCommand,
  CreateContactListCommand,
  CreateTenantResourceAssociationCommand,
  PutEmailIdentityMailFromAttributesCommand,
} from '@aws-sdk/client-sesv2';

import { type AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { AwsSesRegisterDomainService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-register-domain.service';
import { type AwsSesDriverConfig } from 'src/engine/core-modules/emailing-domain/drivers/interfaces/driver-config.interface';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';

describe('AwsSesRegisterDomainService', () => {
  const config: AwsSesDriverConfig = {
    driver: EmailingDomainDriver.AWS_SES,
    region: 'us-east-1',
    accountId: '123456789012',
  };

  const input = {
    domain: 'mail.example.com',
    tenantName: 'twenty-workspace-ws1',
    configurationSetName: 'twenty-workspace-ws1',
    contactListName: 'twenty-workspace-ws1',
  };

  const setUp = () => {
    const send = jest.fn();
    const clientProvider = {
      getSESClient: () => ({ send }),
    } as unknown as AwsSesClientProvider;
    const service = new AwsSesRegisterDomainService(clientProvider);

    return { service, send };
  };

  it('should issue all setup commands in sequence', async () => {
    const { service, send } = setUp();

    send.mockResolvedValue({});

    await service.registerDomain(input, config);

    const commandTypes = send.mock.calls.map(
      ([command]) => command.constructor.name,
    );

    expect(commandTypes).toEqual([
      CreateConfigurationSetCommand.name,
      CreateConfigurationSetEventDestinationCommand.name,
      CreateContactListCommand.name,
      CreateTenantResourceAssociationCommand.name,
      PutEmailIdentityMailFromAttributesCommand.name,
    ]);
  });

  it('should configure custom MAIL FROM using the bounce subdomain', async () => {
    const { service, send } = setUp();

    send.mockResolvedValue({});

    await service.registerDomain(input, config);

    const mailFromCall = send.mock.calls.find(
      ([command]) =>
        command instanceof PutEmailIdentityMailFromAttributesCommand,
    );

    expect(mailFromCall?.[0].input).toMatchObject({
      EmailIdentity: 'mail.example.com',
      MailFromDomain: 'bounce.mail.example.com',
      BehaviorOnMxFailure: 'USE_DEFAULT_VALUE',
    });
  });

  it('should propagate AWS errors to the caller', async () => {
    const { service, send } = setUp();
    const fatalError = new Error('Boom');

    send.mockImplementation(async (command) => {
      if (command instanceof CreateConfigurationSetCommand) {
        throw fatalError;
      }

      return {};
    });

    await expect(service.registerDomain(input, config)).rejects.toBe(
      fatalError,
    );
  });
});
