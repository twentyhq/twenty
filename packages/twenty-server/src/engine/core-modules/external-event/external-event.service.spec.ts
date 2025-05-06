import { Test, TestingModule } from '@nestjs/testing';

import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { ExternalEventService } from './services/external-event.service';

describe('ExternalEventService', () => {
  let service: ExternalEventService;
  let clickhouseService: ClickHouseService;
  let configService: TwentyConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalEventService,
        {
          provide: ClickHouseService,
          useValue: {
            insert: jest.fn(),
          },
        },
        {
          provide: JwtWrapperService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExternalEventService>(ExternalEventService);
    clickhouseService = module.get<ClickHouseService>(ClickHouseService);
    configService = module.get<TwentyConfigService>(TwentyConfigService);
  });

  describe('createExternalEvent', () => {
    const workspaceId = 'test-workspace-id';
    const event = {
      event: 'test.event',
      recordId: 'test-id',
      properties: {
        test: 'value',
      },
    };

    it('should insert a record into ClickHouse', async () => {
      jest
        .spyOn(configService, 'get')
        .mockReturnValue('http://clickhouse:8123');

      jest.spyOn(clickhouseService, 'insert').mockResolvedValue({} as any);

      await service.createExternalEvent(workspaceId, event);

      expect(clickhouseService.insert).toHaveBeenCalledWith('external_events', [
        expect.objectContaining({
          workspaceId,
          event: event.event,
          properties: JSON.stringify(event.properties),
          recordId: event.recordId,
        }),
      ]);
    });

    it('should return failure when clickhouse URL is not configured', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      const result = await service.createExternalEvent(workspaceId, event);

      expect(result.success).toBe(false);
      expect(clickhouseService.insert).not.toHaveBeenCalled();
    });

    it('should handle clickhouse insertion failure', async () => {
      jest
        .spyOn(configService, 'get')
        .mockReturnValue('http://clickhouse:8123');

      jest.spyOn(clickhouseService, 'insert').mockRejectedValue(new Error());

      const result = await service.createExternalEvent(workspaceId, event);

      expect(result.success).toBe(false);
    });
  });
});
