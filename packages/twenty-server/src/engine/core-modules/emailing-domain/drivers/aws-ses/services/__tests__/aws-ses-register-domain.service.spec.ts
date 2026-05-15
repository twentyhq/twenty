import {
  CreateConfigurationSetCommand,
  CreateConfigurationSetEventDestinationCommand,
  CreateContactListCommand,
  CreateTenantResourceAssociationCommand,
  GetConfigurationSetCommand,
  NotFoundException,
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

  const buildNotFound = () =>
    new NotFoundException({
      $metadata: { httpStatusCode: 404 },
      message: 'Configuration set not found.',
    });

  const setUp = () => {
    const send = jest.fn();
    const clientProvider = {
      getSESClient: () => ({ send }),
    } as unknown as AwsSesClientProvider;
    const service = new AwsSesRegisterDomainService(clientProvider);

    return { service, send };
  };

  it('issues every workspace + domain setup command when the configuration set does not yet exist', async () => {
    const { service, send } = setUp();

    send.mockImplementation(async (command) => {
      if (command instanceof GetConfigurationSetCommand) {
        throw buildNotFound();
      }

      return {};
    });

    await service.registerDomain(input, config);

    const commandTypes = send.mock.calls.map(
      ([command]) => command.constructor.name,
    );

    expect(commandTypes).toEqual([
      GetConfigurationSetCommand.name,
      CreateConfigurationSetCommand.name,
      CreateConfigurationSetEventDestinationCommand.name,
      CreateContactListCommand.name,
      CreateTenantResourceAssociationCommand.name,
      PutEmailIdentityMailFromAttributesCommand.name,
    ]);
  });

  // The configuration set, event destination, contact list, and tenant
  // association are all workspace-scoped, so a second domain on the same
  // workspace must not re-issue their creates. Only the per-domain MAIL FROM
  // configuration runs every time.
  it('skips the workspace-scoped creates when the configuration set already exists', async () => {
    const { service, send } = setUp();

    send.mockResolvedValue({});

    await service.registerDomain(input, config);

    const commandTypes = send.mock.calls.map(
      ([command]) => command.constructor.name,
    );

    expect(commandTypes).toEqual([
      GetConfigurationSetCommand.name,
      PutEmailIdentityMailFromAttributesCommand.name,
    ]);
  });

  it('configures custom MAIL FROM using the bounce subdomain', async () => {
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

  // A non-NotFound failure on the existence probe is a real error (e.g. IAM,
  // throttling) and must surface to the caller rather than being silently
  // treated as "not registered".
  it('propagates non-NotFound AWS errors raised by the existence probe', async () => {
    const { service, send } = setUp();
    const fatalError = new Error('Boom');

    send.mockImplementation(async (command) => {
      if (command instanceof GetConfigurationSetCommand) {
        throw fatalError;
      }

      return {};
    });

    await expect(service.registerDomain(input, config)).rejects.toBe(
      fatalError,
    );
  });
});
