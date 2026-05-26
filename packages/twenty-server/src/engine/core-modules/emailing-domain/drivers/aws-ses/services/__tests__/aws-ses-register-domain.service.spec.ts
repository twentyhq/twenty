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

  const provisionInput = {
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

  describe('provisionWorkspaceResources', () => {
    it('creates every workspace-scoped resource when the configuration set does not yet exist', async () => {
      const { service, send } = setUp();

      send.mockImplementation(async (command) => {
        if (command instanceof GetConfigurationSetCommand) {
          throw buildNotFound();
        }

        return {};
      });

      await service.provisionWorkspaceResources(provisionInput, config);

      const commandTypes = send.mock.calls.map(
        ([command]) => command.constructor.name,
      );

      expect(commandTypes).toEqual([
        GetConfigurationSetCommand.name,
        CreateConfigurationSetCommand.name,
        CreateConfigurationSetEventDestinationCommand.name,
        CreateContactListCommand.name,
        CreateTenantResourceAssociationCommand.name,
      ]);
    });

    it('issues no creates when the configuration set already exists', async () => {
      const { service, send } = setUp();

      send.mockResolvedValue({});

      await service.provisionWorkspaceResources(provisionInput, config);

      const commandTypes = send.mock.calls.map(
        ([command]) => command.constructor.name,
      );

      expect(commandTypes).toEqual([GetConfigurationSetCommand.name]);
    });

    it('propagates non-NotFound AWS errors raised by the existence probe', async () => {
      const { service, send } = setUp();
      const fatalError = new Error('Boom');

      send.mockImplementation(async (command) => {
        if (command instanceof GetConfigurationSetCommand) {
          throw fatalError;
        }

        return {};
      });

      await expect(
        service.provisionWorkspaceResources(provisionInput, config),
      ).rejects.toBe(fatalError);
    });
  });

  describe('registerDomain', () => {
    it('configures custom MAIL FROM using the bounce subdomain', async () => {
      const { service, send } = setUp();

      send.mockResolvedValue({});

      await service.registerDomain('mail.example.com');

      const commandTypes = send.mock.calls.map(
        ([command]) => command.constructor.name,
      );

      expect(commandTypes).toEqual([
        PutEmailIdentityMailFromAttributesCommand.name,
      ]);

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
  });
});
