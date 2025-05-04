import { Test, TestingModule } from '@nestjs/testing';

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
  });

  describe('createExternalEvent', () => {
    it('should throw exception when authorization header is missing', async () => {
      const workspaceId = 'test-workspace-id';
      const event = {
        event: 'test.event',
        objectId: 'test-id',
        properties: {},
      };

      await expect(
        controller.createExternalEvent(
          workspaceId,
          null as unknown as string,
          event,
        ),
      ).rejects.toThrow(ExternalEventException);
    });

    it('should throw exception when token validation fails', async () => {
      const workspaceId = 'test-workspace-id';
      const authHeader = 'Bearer invalid-token';
      const event = {
        event: 'test.event',
        objectId: 'test-id',
        properties: {},
      };

      jest
        .spyOn(externalEventTokenService, 'validateToken')
        .mockResolvedValue(false);

      await expect(
        controller.createExternalEvent(workspaceId, authHeader, event),
      ).rejects.toThrow(ExternalEventException);
    });

    it('should throw exception when validation fails', async () => {
      const workspaceId = 'test-workspace-id';
      const authHeader = 'Bearer valid-token';
      const event = {
        event: 'test.event',
        objectId: 'test-id',
        properties: {},
      };

      jest
        .spyOn(externalEventTokenService, 'validateToken')
        .mockResolvedValue(true);

      jest.spyOn(externalEventValidator, 'validate').mockImplementation(() => {
        throw new ExternalEventException(
          'Validation failed',
          ExternalEventExceptionCode.INVALID_INPUT,
        );
      });

      await expect(
        controller.createExternalEvent(workspaceId, authHeader, event),
      ).rejects.toThrow(ExternalEventException);
    });

    it('should throw exception when createExternalEvent fails', async () => {
      const workspaceId = 'test-workspace-id';
      const authHeader = 'Bearer valid-token';
      const event = {
        event: 'test.event',
        objectId: 'test-id',
        properties: {},
      };

      jest
        .spyOn(externalEventTokenService, 'validateToken')
        .mockResolvedValue(true);

      jest
        .spyOn(externalEventService, 'createExternalEvent')
        .mockResolvedValue({ success: false });

      await expect(
        controller.createExternalEvent(workspaceId, authHeader, event),
      ).rejects.toThrow(ExternalEventException);
    });

    it('should return success when everything is valid', async () => {
      const workspaceId = 'test-workspace-id';
      const authHeader = 'Bearer valid-token';
      const event = {
        event: 'test.event',
        objectId: 'test-id',
        properties: {},
      };

      jest
        .spyOn(externalEventTokenService, 'validateToken')
        .mockResolvedValue(true);

      jest
        .spyOn(externalEventService, 'createExternalEvent')
        .mockResolvedValue({ success: true });

      const result = await controller.createExternalEvent(
        workspaceId,
        authHeader,
        event,
      );

      expect(result).toEqual({ success: true });
      expect(externalEventTokenService.validateToken).toHaveBeenCalledWith(
        workspaceId,
        'valid-token',
      );
      expect(externalEventValidator.validate).toHaveBeenCalledWith(event);
      expect(externalEventService.createExternalEvent).toHaveBeenCalledWith(
        workspaceId,
        event,
      );
    });
  });
});
