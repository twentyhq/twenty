import { Test, TestingModule } from '@nestjs/testing';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { ExternalEventService } from './services/external-event.service';

describe('ExternalEventService', () => {
  let service: ExternalEventService;
  let clickHouseService: ClickHouseService;
  let twentyConfigService: TwentyConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalEventService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:8123'),
          },
        },
        {
          provide: ClickHouseService,
          useValue: {
            insert: jest.fn().mockResolvedValue({ success: true }),
          },
        },
        {
          provide: JwtWrapperService,
          useValue: {
            generateAppSecret: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExternalEventService>(ExternalEventService);
    clickHouseService = module.get<ClickHouseService>(ClickHouseService);
    twentyConfigService = module.get<TwentyConfigService>(TwentyConfigService);
  });

  describe('createExternalEvent', () => {
    it('should insert event to clickhouse', async () => {
      const workspaceId = 'test-workspace-id';
      const event = {
        type: 'test.event',
        payload: { test: 'data' },
      };

      await service.createExternalEvent(workspaceId, event);

      expect(clickHouseService.insert).toHaveBeenCalledWith('externalEvent', [
        expect.objectContaining({
          ...event,
          workspaceId,
          createdAt: expect.any(String),
        }),
      ]);
    });

    it('should return success true when clickhouse URL is not configured', async () => {
      const workspaceId = 'test-workspace-id';
      const event = {
        type: 'test.event',
        payload: { test: 'data' },
      };

      // Mock TwentyConfigService to return undefined for CLICKHOUSE_URL
      jest.spyOn(twentyConfigService, 'get').mockReturnValue(undefined);

      const result = await service.createExternalEvent(workspaceId, event);

      expect(result).toEqual({ success: true });
      expect(clickHouseService.insert).not.toHaveBeenCalled();
    });

    it('should return success false when clickhouse insertion fails', async () => {
      const workspaceId = 'test-workspace-id';
      const event = {
        type: 'test.event',
        payload: { test: 'data' },
      };

      jest
        .spyOn(clickHouseService, 'insert')
        .mockRejectedValue(new Error('ClickHouse error'));

      const result = await service.createExternalEvent(workspaceId, event);

      expect(result).toEqual({ success: false });
    });
  });
});
