import {
  AlreadyExistsException,
  CreateConfigurationSetCommand,
  CreateConfigurationSetEventDestinationCommand,
  CreateTenantResourceAssociationCommand,
  PutEmailIdentityMailFromAttributesCommand,
} from '@aws-sdk/client-sesv2';

import { type AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { type AwsSesObservabilityService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-observability.service';
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
  };

  const buildAlreadyExists = () =>
    new AlreadyExistsException({
      $metadata: { httpStatusCode: 409 },
      message: 'Resource already exists.',
    });

  const setUp = () => {
    const send = jest.fn();
    const clientProvider = {
      getSESClient: () => ({ send }),
    } as unknown as AwsSesClientProvider;
    const awsSesObservabilityService = {
      addEventDestination: jest.fn().mockResolvedValue(undefined),
    } as unknown as AwsSesObservabilityService;
    const service = new AwsSesRegisterDomainService(
      clientProvider,
      awsSesObservabilityService,
    );

    return { service, send };
  };

  describe('provisionWorkspaceResources', () => {
    it('creates every workspace-scoped resource', async () => {
      const { service, send } = setUp();

      send.mockResolvedValue({});

      await service.provisionWorkspaceResources(provisionInput, config);

      const commandTypes = send.mock.calls.map(
        ([command]) => command.constructor.name,
      );

      expect(commandTypes).toEqual([
        CreateConfigurationSetCommand.name,
        CreateConfigurationSetEventDestinationCommand.name,
        CreateTenantResourceAssociationCommand.name,
      ]);
    });

    it('ignores AlreadyExistsException per resource so a retry re-runs every step', async () => {
      const { service, send } = setUp();

      send.mockRejectedValue(buildAlreadyExists());

      await service.provisionWorkspaceResources(provisionInput, config);

      const commandTypes = send.mock.calls.map(
        ([command]) => command.constructor.name,
      );

      expect(commandTypes).toEqual([
        CreateConfigurationSetCommand.name,
        CreateConfigurationSetEventDestinationCommand.name,
        CreateTenantResourceAssociationCommand.name,
      ]);
    });

    it('propagates AWS errors that are not AlreadyExistsException', async () => {
      const { service, send } = setUp();
      const fatalError = new Error('Boom');

      send.mockRejectedValue(fatalError);

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
