import { ApplicationHealthCheckService } from 'src/engine/core-modules/application/application-health/application-health-check.service';
import { ApplicationHealthStatus } from 'twenty-shared/application';

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

  it('should report OK without a title when the app reports ok', async () => {
    const { service } = buildService({
      execute: jest.fn().mockResolvedValue({ data: { status: 'OK' } }),
    });

    expect(await run(service)).toEqual({
      status: ApplicationHealthStatus.OK,
      title: null,
      description: null,
      action: null,
    });
  });

  it('should report the reported title, description and action label', async () => {
    const { service } = buildService({
      execute: jest.fn().mockResolvedValue({
        data: {
          status: 'ERROR',
          title: 'Your key was revoked',
          description: 'Generate a new one from the provider dashboard.',
          action: { label: 'Reconnect', location: '#variables' },
        },
      }),
    });

    expect(await run(service)).toEqual({
      status: ApplicationHealthStatus.ERROR,
      title: 'Your key was revoked',
      description: 'Generate a new one from the provider dashboard.',
      action: { label: 'Reconnect', location: '#variables' },
    });
  });

  it.each([
    [ApplicationHealthStatus.SUCCESS],
    [ApplicationHealthStatus.INFO],
    [ApplicationHealthStatus.WARNING],
    [ApplicationHealthStatus.ERROR],
    [ApplicationHealthStatus.NEUTRAL],
  ])('should report a reported %s as is', async (reportedStatus) => {
    const { service } = buildService({
      execute: jest.fn().mockResolvedValue({
        data: { status: reportedStatus, title: 'Expiring' },
      }),
    });

    expect(await run(service)).toEqual({
      status: reportedStatus,
      title: 'Expiring',
      description: null,
      action: null,
    });
  });

  it.each([
    ['the execution errored', { data: null, error: { errorMessage: 'boom' } }],
    ['the result is unreadable', { data: { status: 'NOPE' } }],
    ['the result has no title', { data: { status: 'ERROR' } }],
  ])('should fall back to UNKNOWN when %s', async (_label, executionResult) => {
    const { service } = buildService({
      execute: jest.fn().mockResolvedValue(executionResult),
    });

    expect(await run(service)).toEqual({
      status: ApplicationHealthStatus.UNKNOWN,
      title: null,
      description: null,
      action: null,
    });
  });

  it('should fall back to UNKNOWN when the executor throws', async () => {
    const { service } = buildService({
      execute: jest.fn().mockRejectedValue(new Error('unreachable')),
    });

    expect(await run(service)).toEqual({
      status: ApplicationHealthStatus.UNKNOWN,
      title: null,
      description: null,
      action: null,
    });
  });
});
