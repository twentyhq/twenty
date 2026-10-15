import { ApplicationHealthStatus } from 'twenty-shared/application';

import { type ApplicationHealthCacheService } from 'src/engine/core-modules/application/application-health/application-health-cache.service';
import { ApplicationHealthCheckService } from 'src/engine/core-modules/application/application-health/application-health-check.service';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';

jest.mock('src/engine/core-modules/application/application.service', () => ({
  ApplicationService: class {},
}));
jest.mock(
  'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service',
  () => ({ LogicFunctionExecutorService: class {} }),
);
jest.mock(
  'src/engine/core-modules/application/application-health/application-health-cache.service',
  () => ({ ApplicationHealthCacheService: class {} }),
);

const application = {
  id: 'application-id',
  workspaceId: 'workspace-id',
  version: '1.0.0',
  healthCheckLogicFunctionId: 'health-check-id',
};

describe('ApplicationHealthCheckService - health snapshots', () => {
  const findOneApplicationWithRelationsOrThrow = jest.fn();
  const execute = jest.fn();
  const record = jest.fn();
  let service: ApplicationHealthCheckService;

  beforeEach(() => {
    jest.clearAllMocks();
    findOneApplicationWithRelationsOrThrow.mockResolvedValue(application);
    record.mockResolvedValue(undefined);
    service = new ApplicationHealthCheckService(
      {
        findOneApplicationWithRelationsOrThrow,
      } as unknown as ApplicationService,
      { execute } as unknown as LogicFunctionExecutorService,
      { record } as unknown as ApplicationHealthCacheService,
    );
  });

  it.each([
    { status: ApplicationHealthStatus.OK },
    {
      status: ApplicationHealthStatus.WARNING,
      title: 'Connect an account',
      action: { label: 'Connect', location: '/settings/accounts' },
    },
    { status: ApplicationHealthStatus.ERROR, title: 'Reconnect the app' },
  ])('records the reported $status after a check', async (data) => {
    execute.mockResolvedValue({ data });

    const result = await service.run({
      applicationId: application.id,
      workspaceId: application.workspaceId,
    });

    expect(result?.status).toBe(data.status);
    expect(record).toHaveBeenCalledWith(application, data.status);
  });

  it('keeps failed health-check execution unknown', async () => {
    execute.mockRejectedValue(new Error('Function timed out'));

    expect(
      await service.run({
        applicationId: application.id,
        workspaceId: application.workspaceId,
      }),
    ).toMatchObject({ status: ApplicationHealthStatus.UNKNOWN });
    expect(record).toHaveBeenCalledWith(
      application,
      ApplicationHealthStatus.UNKNOWN,
    );
  });

  it('does not record health for an app without a check', async () => {
    findOneApplicationWithRelationsOrThrow.mockResolvedValue({
      ...application,
      healthCheckLogicFunctionId: null,
    });

    expect(
      await service.run({
        applicationId: application.id,
        workspaceId: application.workspaceId,
      }),
    ).toBeNull();
    expect(execute).not.toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });
});
