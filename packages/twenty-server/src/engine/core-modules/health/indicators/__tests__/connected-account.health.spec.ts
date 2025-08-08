import { HealthIndicatorService } from '@nestjs/terminus';
import { Test, type TestingModule } from '@nestjs/testing';

import { HEALTH_ERROR_MESSAGES } from 'src/engine/core-modules/health/constants/health-error-messages.constants';
import { HEALTH_INDICATORS_TIMEOUT } from 'src/engine/core-modules/health/constants/health-indicators-timeout.conts';
import { METRICS_FAILURE_RATE_THRESHOLD } from 'src/engine/core-modules/health/constants/metrics-failure-rate-threshold.const';
import { ConnectedAccountHealth } from 'src/engine/core-modules/health/indicators/connected-account.health';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { CalendarChannelSyncStatus } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { MessageChannelSyncStatus } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

describe('ConnectedAccountHealth', () => {
  let service: ConnectedAccountHealth;
  let metricsService: jest.Mocked<MetricsService>;
  let healthIndicatorService: jest.Mocked<HealthIndicatorService>;

  beforeEach(async () => {
    metricsService = {
      groupMetrics: jest.fn(),
    } as any;

    healthIndicatorService = {
      check: jest.fn().mockImplementation((key) => ({
        up: jest.fn().mockImplementation((data) => ({
          [key]: {
            status: 'up',
            details: data.details,
          },
        })),
        down: jest.fn().mockImplementation((data) => ({
          [key]: {
            status: 'down',
            error: data.error,
            details: data.details,
          },
        })),
      })),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectedAccountHealth,
        {
          provide: MetricsService,
          useValue: metricsService,
        },
        {
          provide: HealthIndicatorService,
          useValue: healthIndicatorService,
        },
      ],
    }).compile();

    service = module.get<ConnectedAccountHealth>(ConnectedAccountHealth);
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('message sync health', () => {
    it('should return up status when no message sync jobs are present', async () => {
      metricsService.groupMetrics
        .mockResolvedValueOnce({
          [MessageChannelSyncStatus.NOT_SYNCED]: 0,
          [MessageChannelSyncStatus.ACTIVE]: 0,
          [MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS]: 0,
          [MessageChannelSyncStatus.FAILED_UNKNOWN]: 0,
        })
        .mockResolvedValueOnce({
          [CalendarChannelSyncStatus.NOT_SYNCED]: 0,
          [CalendarChannelSyncStatus.ACTIVE]: 0,
        });

      const result = await service.isHealthy();

      expect(result.connectedAccount.status).toBe('up');
      expect(result.connectedAccount.details.messageSync.status).toBe('up');
      expect(
        result.connectedAccount.details.messageSync.details.totalJobs,
      ).toBe(0);
      expect(
        result.connectedAccount.details.messageSync.details.failedJobs,
      ).toBe(0);
      expect(
        result.connectedAccount.details.messageSync.details.failureRate,
      ).toBe(0);
    });

    it(`should return down status when message sync failure rate is above ${METRICS_FAILURE_RATE_THRESHOLD}%`, async () => {
      metricsService.groupMetrics
        .mockResolvedValueOnce({
          [MessageChannelSyncStatus.NOT_SYNCED]: 0,
          [MessageChannelSyncStatus.ACTIVE]: 1,
          [MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS]: 2,
          [MessageChannelSyncStatus.FAILED_UNKNOWN]: 2,
        })
        .mockResolvedValueOnce({
          [CalendarChannelSyncStatus.NOT_SYNCED]: 0,
          [CalendarChannelSyncStatus.ACTIVE]: 1,
        });

      const result = await service.isHealthy();

      expect(result.connectedAccount.status).toBe('down');
      expect(result.connectedAccount.error).toBe(
        HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_HIGH_FAILURE_RATE,
      );
      expect(result.connectedAccount.details.messageSync.status).toBe('down');
      expect(result.connectedAccount.details.messageSync.error).toBe(
        HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_HIGH_FAILURE_RATE,
      );
      expect(
        result.connectedAccount.details.messageSync.details.failureRate,
      ).toBe(40);
    });
  });

  describe('calendar sync health', () => {
    it('should return up status when no calendar sync jobs are present', async () => {
      metricsService.groupMetrics
        .mockResolvedValueOnce({
          [MessageChannelSyncStatus.NOT_SYNCED]: 0,
          [MessageChannelSyncStatus.ACTIVE]: 0,
        })
        .mockResolvedValueOnce({
          [CalendarChannelSyncStatus.NOT_SYNCED]: 0,
          [CalendarChannelSyncStatus.ACTIVE]: 0,
          [CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS]: 0,
          [CalendarChannelSyncStatus.FAILED_UNKNOWN]: 0,
        });

      const result = await service.isHealthy();

      expect(result.connectedAccount.status).toBe('up');
      expect(result.connectedAccount.details.calendarSync.status).toBe('up');
      expect(
        result.connectedAccount.details.calendarSync.details.totalJobs,
      ).toBe(0);
      expect(
        result.connectedAccount.details.calendarSync.details.failedJobs,
      ).toBe(0);
      expect(
        result.connectedAccount.details.calendarSync.details.failureRate,
      ).toBe(0);
    });

    it(`should return down status when calendar sync failure rate is above ${METRICS_FAILURE_RATE_THRESHOLD}%`, async () => {
      metricsService.groupMetrics
        .mockResolvedValueOnce({
          [MessageChannelSyncStatus.NOT_SYNCED]: 0,
          [MessageChannelSyncStatus.ACTIVE]: 1,
        })
        .mockResolvedValueOnce({
          [CalendarChannelSyncStatus.NOT_SYNCED]: 0,
          [CalendarChannelSyncStatus.ACTIVE]: 1,
          [CalendarChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS]: 2,
          [CalendarChannelSyncStatus.FAILED_UNKNOWN]: 2,
        });

      const result = await service.isHealthy();

      expect(result.connectedAccount.status).toBe('down');
      expect(result.connectedAccount.error).toBe(
        HEALTH_ERROR_MESSAGES.CALENDAR_SYNC_HIGH_FAILURE_RATE,
      );
      expect(result.connectedAccount.details.calendarSync.status).toBe('down');
      expect(result.connectedAccount.details.calendarSync.error).toBe(
        HEALTH_ERROR_MESSAGES.CALENDAR_SYNC_HIGH_FAILURE_RATE,
      );
      expect(
        result.connectedAccount.details.calendarSync.details.failureRate,
      ).toBe(40);
    });
  });

  describe('timeout handling', () => {
    it('should handle message sync timeout', async () => {
      metricsService.groupMetrics
        .mockResolvedValueOnce(
          new Promise((resolve) =>
            setTimeout(resolve, HEALTH_INDICATORS_TIMEOUT + 100),
          ),
        )
        .mockResolvedValueOnce({
          [CalendarChannelSyncStatus.NOT_SYNCED]: 0,
          [CalendarChannelSyncStatus.ACTIVE]: 1,
        });

      const healthCheckPromise = service.isHealthy();

      jest.advanceTimersByTime(HEALTH_INDICATORS_TIMEOUT + 1);
      const result = await healthCheckPromise;

      expect(result.connectedAccount.status).toBe('down');
      expect(result.connectedAccount.error).toBe(
        HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_TIMEOUT,
      );
      expect(result.connectedAccount.details.messageSync.status).toBe('down');
      expect(result.connectedAccount.details.messageSync.error).toBe(
        HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_TIMEOUT,
      );
    });

    it('should handle calendar sync timeout', async () => {
      metricsService.groupMetrics
        .mockResolvedValueOnce({
          [MessageChannelSyncStatus.NOT_SYNCED]: 0,
          [MessageChannelSyncStatus.ACTIVE]: 1,
        })
        .mockResolvedValueOnce(
          new Promise((resolve) =>
            setTimeout(resolve, HEALTH_INDICATORS_TIMEOUT + 100),
          ),
        );

      const healthCheckPromise = service.isHealthy();

      jest.advanceTimersByTime(HEALTH_INDICATORS_TIMEOUT + 1);
      const result = await healthCheckPromise;

      expect(result.connectedAccount.status).toBe('down');
      expect(result.connectedAccount.error).toBe(
        HEALTH_ERROR_MESSAGES.CALENDAR_SYNC_TIMEOUT,
      );
      expect(result.connectedAccount.details.calendarSync.status).toBe('down');
      expect(result.connectedAccount.details.calendarSync.error).toBe(
        HEALTH_ERROR_MESSAGES.CALENDAR_SYNC_TIMEOUT,
      );
    });
  });

  describe('combined health check', () => {
    it('should return combined status with both checks healthy', async () => {
      metricsService.groupMetrics
        .mockResolvedValueOnce({
          [MessageChannelSyncStatus.NOT_SYNCED]: 0,
          [MessageChannelSyncStatus.ACTIVE]: 8,
          [MessageChannelSyncStatus.FAILED_UNKNOWN]: 1,
        })
        .mockResolvedValueOnce({
          [CalendarChannelSyncStatus.NOT_SYNCED]: 0,
          [CalendarChannelSyncStatus.ACTIVE]: 8,
          [CalendarChannelSyncStatus.FAILED_UNKNOWN]: 1,
        });

      const result = await service.isHealthy();

      expect(result.connectedAccount.status).toBe('up');
      expect(result.connectedAccount.details.messageSync.status).toBe('up');
      expect(result.connectedAccount.details.calendarSync.status).toBe('up');
    });

    it('should return down status when both syncs fail', async () => {
      metricsService.groupMetrics
        .mockResolvedValueOnce({
          [MessageChannelSyncStatus.NOT_SYNCED]: 0,
          [MessageChannelSyncStatus.ACTIVE]: 1,
          [MessageChannelSyncStatus.FAILED_UNKNOWN]: 2,
        })
        .mockResolvedValueOnce({
          [CalendarChannelSyncStatus.NOT_SYNCED]: 0,
          [CalendarChannelSyncStatus.ACTIVE]: 1,
          [CalendarChannelSyncStatus.FAILED_UNKNOWN]: 2,
        });

      const result = await service.isHealthy();

      expect(result.connectedAccount.status).toBe('down');
      expect(result.connectedAccount.error).toBe(
        `${HEALTH_ERROR_MESSAGES.MESSAGE_SYNC_HIGH_FAILURE_RATE} and ${HEALTH_ERROR_MESSAGES.CALENDAR_SYNC_HIGH_FAILURE_RATE}`,
      );
      expect(result.connectedAccount.details.messageSync.status).toBe('down');
      expect(result.connectedAccount.details.calendarSync.status).toBe('down');
    });
  });
});
