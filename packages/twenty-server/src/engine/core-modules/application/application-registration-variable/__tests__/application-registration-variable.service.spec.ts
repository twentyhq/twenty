import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const APPLICATION_REGISTRATION_ID = 'application-registration-id';

describe('ApplicationRegistrationVariableService', () => {
  let service: ApplicationRegistrationVariableService;
  let findVariables: jest.Mock;

  beforeEach(async () => {
    findVariables = jest.fn().mockResolvedValue([
      { key: 'APP_API_KEY', encryptedValue: 'enc:key' },
      { key: 'APP_REGION', encryptedValue: 'enc:' },
      { key: 'TWENTY_LEGACY_SETTING', encryptedValue: 'enc:legacy' },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationVariableService,
        {
          provide: getRepositoryToken(ApplicationRegistrationVariableEntity),
          useValue: { find: findVariables },
        },
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: {},
        },
        { provide: getRepositoryToken(ApplicationEntity), useValue: {} },
        {
          provide: SecretEncryptionService,
          useValue: {
            decryptVersionedOrThrow: (encryptedValue: string) =>
              encryptedValue.replace(/^enc:/, ''),
          },
        },
        { provide: ApplicationRegistrationLookupService, useValue: {} },
      ],
    }).compile();

    service = module.get(ApplicationRegistrationVariableService);
  });

  describe('getServerEnvVariables', () => {
    it('should give logic functions the filled server variables, without reserved names', async () => {
      const envVariables = await service.getServerEnvVariables({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
      });

      expect(envVariables).toEqual({ APP_API_KEY: 'key' });
    });

    it('should give no server variables to an application without a registration', async () => {
      const envVariables = await service.getServerEnvVariables({
        applicationRegistrationId: null,
      });

      expect(envVariables).toEqual({});
      expect(findVariables).not.toHaveBeenCalled();
    });
  });
});
