import { AdminPanelResolver } from 'src/engine/core-modules/admin-panel/admin-panel.resolver';
import { HealthIndicatorId } from 'src/engine/core-modules/admin-panel/enums/health-indicator-id.enum';
import { QueueMetricsTimeRange } from 'src/engine/core-modules/admin-panel/enums/queue-metrics-time-range.enum';
import {
  ConfigVariableException,
  ConfigVariableExceptionCode,
} from 'src/engine/core-modules/twenty-config/twenty-config.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('AdminPanelResolver', () => {
  let resolver: AdminPanelResolver;
  let twentyConfigService: jest.Mocked<
    Pick<TwentyConfigService, 'delete' | 'set' | 'update'>
  >;

  beforeEach(() => {
    twentyConfigService = {
      delete: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
    };

    resolver = new AdminPanelResolver(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      twentyConfigService as unknown as TwentyConfigService,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  it('should block creating database config variables', async () => {
    await expect(
      resolver.createDatabaseConfigVariable(
        'SERVER_URL',
        'https://example.com',
      ),
    ).rejects.toMatchObject({
      code: ConfigVariableExceptionCode.DATABASE_CONFIG_WRITE_DISABLED,
    } satisfies Partial<ConfigVariableException>);

    expect(twentyConfigService.set).not.toHaveBeenCalled();
  });

  it('should block updating database config variables', async () => {
    await expect(
      resolver.updateDatabaseConfigVariable(
        'SERVER_URL',
        'https://example.com',
      ),
    ).rejects.toMatchObject({
      code: ConfigVariableExceptionCode.DATABASE_CONFIG_WRITE_DISABLED,
    } satisfies Partial<ConfigVariableException>);

    expect(twentyConfigService.update).not.toHaveBeenCalled();
  });

  it('should block deleting database config variables', async () => {
    await expect(
      resolver.deleteDatabaseConfigVariable('SERVER_URL'),
    ).rejects.toMatchObject({
      code: ConfigVariableExceptionCode.DATABASE_CONFIG_WRITE_DISABLED,
    } satisfies Partial<ConfigVariableException>);

    expect(twentyConfigService.delete).not.toHaveBeenCalled();
  });

  it('should block system health status reads', async () => {
    await expect(resolver.getSystemHealthStatus()).rejects.toThrow(
      'Health status is disabled',
    );
  });

  it('should block indicator health status reads', async () => {
    await expect(
      resolver.getIndicatorHealthStatus(HealthIndicatorId.app),
    ).rejects.toThrow('Health status is disabled');
  });

  it('should block queue metrics reads', async () => {
    await expect(
      resolver.getQueueMetrics('queue-name', QueueMetricsTimeRange.OneHour),
    ).rejects.toThrow('Health status is disabled');
  });
});
