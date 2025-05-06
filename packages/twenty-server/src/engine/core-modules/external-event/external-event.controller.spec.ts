import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';

import { ExternalEventController } from './external-event.controller';
import {
  ExternalEventException,
  ExternalEventExceptionCode,
} from './external-event.exception';

import { ExternalEventTokenService } from './services/external-event-token.service';
import { ExternalEventService } from './services/external-event.service';
import { ExternalEventValidator } from './validators/external-event.validator';

describe('ExternalEventController', () => {
  let controller: ExternalEventController;
  let externalEventService: ExternalEventService;
  let externalEventTokenService: ExternalEventTokenService;
  let externalEventValidator: ExternalEventValidator;
  let mockFeatureFlagRepository: Repository<FeatureFlag>;
  let mockExternalEventTokenService: ExternalEventTokenService;
  let mockExternalEventService: ExternalEventService;
  let mockExternalEventValidator: ExternalEventValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalEventController],
      providers: [
        {
          provide: ExternalEventService,
          useValue: {
            createExternalEvent: jest.fn().mockResolvedValue({ success: true }),
          },
        },
        {
          provide: ExternalEventTokenService,
          useValue: {
            validateToken: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: ExternalEventValidator,
          useValue: {
            validate: jest.fn(),
          },
        },
        {
          provide: Repository,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExternalEventController>(ExternalEventController);
    externalEventService =
      module.get<ExternalEventService>(ExternalEventService);
    externalEventTokenService = module.get<ExternalEventTokenService>(
      ExternalEventTokenService,
    );
    externalEventValidator = module.get<ExternalEventValidator>(
      ExternalEventValidator,
    );
    mockFeatureFlagRepository = module.get<Repository<FeatureFlag>>(Repository);
    mockExternalEventTokenService = module.get<ExternalEventTokenService>(
      ExternalEventTokenService,
    );
    mockExternalEventService =
      module.get<ExternalEventService>(ExternalEventService);
    mockExternalEventValidator = module.get<ExternalEventValidator>(
      ExternalEventValidator,
    );
  });

  describe('createExternalEvent', () => {
    const workspaceId = 'test-workspace-id';
    const authHeader = 'Bearer test-token';
    const event = {
      event: 'test.event',
      recordId: 'test-id',
      properties: {},
    };

    it('should throw an exception when feature is not enabled', async () => {
      jest.spyOn(mockFeatureFlagRepository, 'findOne').mockResolvedValue(null);

      await expect(
        controller.createExternalEvent(workspaceId, authHeader, event),
      ).rejects.toThrow(ExternalEventException);
    });

    it('should throw an exception when authorization header is missing', async () => {
      jest.spyOn(mockFeatureFlagRepository, 'findOne').mockResolvedValue({
        id: 'test-id',
        workspaceId,
        key: FeatureFlagKey.IsExternalEventEnabled,
        value: true,
      } as FeatureFlag);

      await expect(
        controller.createExternalEvent(workspaceId, '' as string, event),
      ).rejects.toThrow(ExternalEventException);
    });

    it('should throw an exception when token validation fails', async () => {
      jest.spyOn(mockFeatureFlagRepository, 'findOne').mockResolvedValue({
        id: 'test-id',
        workspaceId,
        key: FeatureFlagKey.IsExternalEventEnabled,
        value: true,
      } as FeatureFlag);

      jest
        .spyOn(mockExternalEventTokenService, 'validateToken')
        .mockResolvedValue(false);

      await expect(
        controller.createExternalEvent(workspaceId, authHeader, event),
      ).rejects.toThrow(ExternalEventException);
    });

    it('should throw an exception when validation fails', async () => {
      jest.spyOn(mockFeatureFlagRepository, 'findOne').mockResolvedValue({
        id: 'test-id',
        workspaceId,
        key: FeatureFlagKey.IsExternalEventEnabled,
        value: true,
      } as FeatureFlag);

      jest
        .spyOn(mockExternalEventTokenService, 'validateToken')
        .mockResolvedValue(true);

      jest
        .spyOn(mockExternalEventValidator, 'validate')
        .mockImplementation(() => {
          throw new ExternalEventException(
            'Validation error',
            ExternalEventExceptionCode.INVALID_INPUT,
          );
        });

      await expect(
        controller.createExternalEvent(workspaceId, authHeader, event),
      ).rejects.toThrow(ExternalEventException);
    });

    it('should throw an exception when createExternalEvent fails', async () => {
      jest.spyOn(mockFeatureFlagRepository, 'findOne').mockResolvedValue({
        id: 'test-id',
        workspaceId,
        key: FeatureFlagKey.IsExternalEventEnabled,
        value: true,
      } as FeatureFlag);

      jest
        .spyOn(mockExternalEventTokenService, 'validateToken')
        .mockResolvedValue(true);

      jest
        .spyOn(mockExternalEventService, 'createExternalEvent')
        .mockResolvedValue({ success: false });

      await expect(
        controller.createExternalEvent(workspaceId, authHeader, event),
      ).rejects.toThrow(ExternalEventException);
    });

    it('should return success when operation succeeds', async () => {
      jest.spyOn(mockFeatureFlagRepository, 'findOne').mockResolvedValue({
        id: 'test-id',
        workspaceId,
        key: FeatureFlagKey.IsExternalEventEnabled,
        value: true,
      } as FeatureFlag);

      jest
        .spyOn(mockExternalEventTokenService, 'validateToken')
        .mockResolvedValue(true);

      jest
        .spyOn(mockExternalEventService, 'createExternalEvent')
        .mockResolvedValue({ success: true });

      const result = await controller.createExternalEvent(
        workspaceId,
        authHeader,
        event,
      );

      expect(result).toEqual({ success: true });
    });
  });
});
