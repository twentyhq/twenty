import { ApplicationHealthCheckService } from 'src/engine/core-modules/application/application-health/application-health-check.service';
import { ApplicationHealthStatus } from 'src/engine/core-modules/application/enums/application-health-status.enum';

const APPLICATION_ID = 'a7d3f1c2-1111-4222-8333-444455556666';
const WORKSPACE_ID = 'b7d3f1c2-1111-4222-8333-444455556666';
const HEALTH_CHECK_ID = 'c7d3f1c2-1111-4222-8333-444455556666';

const buildService = ({
  healthCheckLogicFunctionId = HEALTH_CHECK_ID,
  execute = jest.fn(),
}: {
  healthCheckLogicFunctionId?: string | null;
  execute?: jest.Mock;
} = {}) => {
  const applicationService = {
    findOneApplicationWithRelationsOrThrow: jest.fn().mockResolvedValue({
      id: APPLICATION_ID,
      version: '1.0.0',
      healthCheckLogicFunctionId,
    }),
  };

  const service = new ApplicationHealthCheckService(
    applicationService as never,
    { execute } as never,
  );

  return { service, execute };
};

const run = (service: ApplicationHealthCheckService) =>
  service.run({ applicationId: APPLICATION_ID, workspaceId: WORKSPACE_ID });

describe('ApplicationHealthCheckService', () => {
  it('should do nothing when the application declares no health check', async () => {
    const { service, execute } = buildService({
      healthCheckLogicFunctionId: null,
    });

    expect(await run(service)).toBeNull();
    expect(execute).not.toHaveBeenCalled();
  });

  it('should report OK without a message when the app reports ok', async () => {
    const { service } = buildService({
      execute: jest.fn().mockResolvedValue({ data: { status: 'ok' } }),
    });

    expect(await run(service)).toEqual({
      status: ApplicationHealthStatus.OK,
      message: null,
      action: null,
    });
  });

  it('should report the reported message and action label', async () => {
    const { service } = buildService({
      execute: jest.fn().mockResolvedValue({
        data: {
          status: 'error',
          message: 'Your key was revoked',
          action: { label: 'Reconnect', location: 'variables' },
        },
      }),
    });

    expect(await run(service)).toEqual({
      status: ApplicationHealthStatus.ERROR,
      message: 'Your key was revoked',
      action: { label: 'Reconnect', location: 'variables' },
    });
  });

  it('should map a reported warning to WARNING', async () => {
    const { service } = buildService({
      execute: jest.fn().mockResolvedValue({
        data: { status: 'warning', message: 'Expiring' },
      }),
    });

    expect(await run(service)).toEqual({
      status: ApplicationHealthStatus.WARNING,
      message: 'Expiring',
      action: null,
    });
  });

  it.each([
    ['the execution errored', { data: null, error: { errorMessage: 'boom' } }],
    ['the result is unreadable', { data: { status: 'nope' } }],
    ['the result has no message', { data: { status: 'error' } }],
  ])('should fall back to UNKNOWN when %s', async (_label, executionResult) => {
    const { service } = buildService({
      execute: jest.fn().mockResolvedValue(executionResult),
    });

    expect(await run(service)).toEqual({
      status: ApplicationHealthStatus.UNKNOWN,
      message: null,
      action: null,
    });
  });

  it('should fall back to UNKNOWN when the executor throws', async () => {
    const { service } = buildService({
      execute: jest.fn().mockRejectedValue(new Error('unreachable')),
    });

    expect(await run(service)).toEqual({
      status: ApplicationHealthStatus.UNKNOWN,
      message: null,
      action: null,
    });
  });
});
