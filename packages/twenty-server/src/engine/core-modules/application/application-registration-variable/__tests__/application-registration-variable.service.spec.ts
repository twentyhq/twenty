import { type Repository } from 'typeorm';

import { type ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const REGISTRATION_ID = 'registration-id';
const OWNER_WORKSPACE_ID = 'owner-ws';

const buildVariable = (
  overrides: Partial<ApplicationRegistrationVariableEntity> = {},
): ApplicationRegistrationVariableEntity =>
  ({
    applicationRegistrationId: REGISTRATION_ID,
    isRequired: true,
    get isFilled() {
      return this.encryptedValue !== '';
    },
    encryptedValue: 'value',
    ...overrides,
  }) as unknown as ApplicationRegistrationVariableEntity;

const buildRegistration = (
  overrides: Partial<ApplicationRegistrationEntity> = {},
): ApplicationRegistrationEntity =>
  ({
    id: REGISTRATION_ID,
    ownerWorkspaceId: OWNER_WORKSPACE_ID,
    manifest: { logicFunctions: [] },
    ...overrides,
  }) as unknown as ApplicationRegistrationEntity;

const serverRouteManifest = {
  logicFunctions: [
    { serverRouteTriggerSettings: { forwardedRequestHeaders: [] } },
  ],
};

describe('ApplicationRegistrationVariableService.isConfiguredBatch', () => {
  let service: ApplicationRegistrationVariableService;
  let variableRepository: jest.Mocked<
    Pick<Repository<ApplicationRegistrationVariableEntity>, 'find'>
  >;
  let applicationRegistrationRepository: jest.Mocked<
    Pick<Repository<ApplicationRegistrationEntity>, 'find'>
  >;
  let applicationRepository: jest.Mocked<
    Pick<Repository<ApplicationEntity>, 'find'>
  >;

  const setup = ({
    variables = [buildVariable()],
    registrations = [buildRegistration()],
    installedApps = [],
  }: {
    variables?: ApplicationRegistrationVariableEntity[];
    registrations?: ApplicationRegistrationEntity[];
    installedApps?: Pick<
      ApplicationEntity,
      'applicationRegistrationId' | 'workspaceId'
    >[];
  }) => {
    variableRepository = { find: jest.fn().mockResolvedValue(variables) };
    applicationRegistrationRepository = {
      find: jest.fn().mockResolvedValue(registrations),
    };
    applicationRepository = {
      find: jest.fn().mockResolvedValue(installedApps),
    };

    service = new ApplicationRegistrationVariableService(
      variableRepository as unknown as Repository<ApplicationRegistrationVariableEntity>,
      applicationRegistrationRepository as unknown as Repository<ApplicationRegistrationEntity>,
      applicationRepository as unknown as Repository<ApplicationEntity>,
      {} as unknown as SecretEncryptionService,
    );
  };

  it('is configured when all required variables are filled and no server route is exposed', async () => {
    setup({});

    const result = await service.isConfiguredBatch([REGISTRATION_ID]);

    expect(result.get(REGISTRATION_ID)).toBe(true);
  });

  it('is not configured when a required variable is missing', async () => {
    setup({ variables: [buildVariable({ encryptedValue: '' })] });

    const result = await service.isConfiguredBatch([REGISTRATION_ID]);

    expect(result.get(REGISTRATION_ID)).toBe(false);
  });

  it('is not configured when the app exposes a server route but has no owner workspace', async () => {
    setup({
      registrations: [
        buildRegistration({
          ownerWorkspaceId: null,
          manifest:
            serverRouteManifest as ApplicationRegistrationEntity['manifest'],
        }),
      ],
    });

    const result = await service.isConfiguredBatch([REGISTRATION_ID]);

    expect(result.get(REGISTRATION_ID)).toBe(false);
  });

  it('is not configured when the app exposes a server route but is not installed on its owner workspace', async () => {
    setup({
      registrations: [
        buildRegistration({
          manifest:
            serverRouteManifest as ApplicationRegistrationEntity['manifest'],
        }),
      ],
      installedApps: [
        { applicationRegistrationId: REGISTRATION_ID, workspaceId: 'other-ws' },
      ],
    });

    const result = await service.isConfiguredBatch([REGISTRATION_ID]);

    expect(result.get(REGISTRATION_ID)).toBe(false);
  });

  it('is configured when the app exposes a server route and is installed on its owner workspace', async () => {
    setup({
      registrations: [
        buildRegistration({
          manifest:
            serverRouteManifest as ApplicationRegistrationEntity['manifest'],
        }),
      ],
      installedApps: [
        {
          applicationRegistrationId: REGISTRATION_ID,
          workspaceId: OWNER_WORKSPACE_ID,
        },
      ],
    });

    const result = await service.isConfiguredBatch([REGISTRATION_ID]);

    expect(result.get(REGISTRATION_ID)).toBe(true);
  });
});
