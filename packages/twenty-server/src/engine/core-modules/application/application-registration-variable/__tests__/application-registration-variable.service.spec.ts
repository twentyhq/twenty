import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FieldMetadataType } from 'twenty-shared/types';
import { In, Not } from 'typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const APPLICATION_REGISTRATION_ID = 'a1b2c3d4-0000-0000-0000-000000000001';

describe('ApplicationRegistrationVariableService', () => {
  let service: ApplicationRegistrationVariableService;
  let variableRepository: {
    find: jest.Mock;
    update: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    variableRepository = {
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(undefined),
      create: jest.fn((entity) => entity),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationVariableService,
        {
          provide: getRepositoryToken(ApplicationRegistrationVariableEntity),
          useValue: variableRepository,
        },
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: {},
        },
        { provide: getRepositoryToken(ApplicationEntity), useValue: {} },
        { provide: SecretEncryptionService, useValue: {} },
      ],
    }).compile();

    service = module.get(ApplicationRegistrationVariableService);
  });

  describe('syncVariableSchemas', () => {
    it('should only delete unfilled stale variables when the manifest declares variables', async () => {
      await service.syncVariableSchemas(APPLICATION_REGISTRATION_ID, {
        PEOPLE_DATA_LABS_APP_API_KEY: {
          description: 'People Data Labs API key',
          isSecret: true,
          isRequired: true,
          type: FieldMetadataType.TEXT,
        },
      });

      expect(variableRepository.delete).toHaveBeenCalledWith({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        key: Not(In(['PEOPLE_DATA_LABS_APP_API_KEY'])),
        encryptedValue: '',
      });
    });

    it('should only delete unfilled variables when the manifest declares none', async () => {
      await service.syncVariableSchemas(APPLICATION_REGISTRATION_ID, {});

      expect(variableRepository.delete).toHaveBeenCalledWith({
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        encryptedValue: '',
      });
    });

    it('should create a missing variable declared by the manifest', async () => {
      await service.syncVariableSchemas(APPLICATION_REGISTRATION_ID, {
        PEOPLE_DATA_LABS_APP_API_KEY: { description: 'key', isSecret: true },
      });

      expect(variableRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationRegistrationId: APPLICATION_REGISTRATION_ID,
          key: 'PEOPLE_DATA_LABS_APP_API_KEY',
          encryptedValue: '',
        }),
      );
    });

    it('should update metadata of an existing variable without touching its value', async () => {
      variableRepository.find.mockResolvedValue([
        {
          id: 'variable-id',
          key: 'PEOPLE_DATA_LABS_APP_API_KEY',
          encryptedValue: 'enc:v2:something',
        },
      ]);

      await service.syncVariableSchemas(APPLICATION_REGISTRATION_ID, {
        PEOPLE_DATA_LABS_APP_API_KEY: { description: 'key', isSecret: true },
      });

      expect(variableRepository.save).not.toHaveBeenCalled();
      expect(variableRepository.update).toHaveBeenCalledWith('variable-id', {
        description: 'key',
        isSecret: true,
        isRequired: false,
        type: FieldMetadataType.TEXT,
        options: null,
      });
    });
  });
});
