import { ApplicationJobService } from 'src/engine/core-modules/application/application-job/services/application-job.service';
import { type EnqueueJobsInputDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-jobs.input';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';
const LOGIC_FUNCTION_ID = 'logic-function-id';
const LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER =
  'b6f9a5b4-1d4e-4a4b-9c55-6c1f0b2a7e11';

const buildService = () => {
  const bulkAdd = jest.fn(
    async (
      _jobName: string,
      jobs: { jobId: string }[],
      _options: Record<string, unknown>,
    ) => ({
      jobs: jobs.map(({ jobId }, index) => ({
        jobId,
        sizeBytes: 100,
        scheduledAt: 1_000 + index,
      })),
      availableBytes: null,
    }),
  );
  const getOrRecompute = jest.fn().mockResolvedValue({
    flatLogicFunctionMaps: {
      byUniversalIdentifier: {
        [LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER]: {
          id: LOGIC_FUNCTION_ID,
          universalIdentifier: LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
          applicationId: APPLICATION_ID,
          deletedAt: null,
          retryLimit: null,
        },
      },
    },
    flatApplicationMaps: {
      byId: {
        [APPLICATION_ID]: {
          id: APPLICATION_ID,
          universalIdentifier: 'application',
          deletedAt: null,
        },
      },
    },
  });
  const service = new ApplicationJobService(
    { getOrRecompute } as never,
    { bulkAdd } as never,
  );

  const enqueueJobs = (input: Partial<EnqueueJobsInputDTO>) =>
    service.enqueueJobs({
      applicationId: APPLICATION_ID,
      workspaceId: WORKSPACE_ID,
      userId: null,
      userWorkspaceId: null,
      input: {
        logicFunctionUniversalIdentifier: LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        jobs: [{ jobId: 'job-1' }, { jobId: 'job-2' }],
        ...input,
      },
    });

  return { enqueueJobs, bulkAdd, getOrRecompute };
};

const expectInvalidInput = async (promise: Promise<unknown>) => {
  await expect(promise).rejects.toBeInstanceOf(ApplicationException);
  await expect(promise).rejects.toMatchObject({
    code: ApplicationExceptionCode.INVALID_INPUT,
  });
};

describe('ApplicationJobService.enqueueJobs', () => {
  it.each([0, 1_000])(
    'rejects delayMs %s combined with a limiter before reading or adding anything',
    async (delayMs) => {
      const { enqueueJobs, bulkAdd, getOrRecompute } = buildService();

      await expectInvalidInput(
        enqueueJobs({ delayMs, limiter: { max: 1, durationMs: 1_000 } }),
      );
      expect(getOrRecompute).not.toHaveBeenCalled();
      expect(bulkAdd).not.toHaveBeenCalled();
    },
  );

  it.each([
    { max: 100, durationMs: 9_999 },
    { max: 1, durationMs: 60 * 60 * 1_000 + 1 },
    { max: 0, durationMs: 1_000 },
    { max: 1.5, durationMs: 1_000 },
    { max: 1, durationMs: 1_000.5 },
  ])('rejects the limiter %o', async (limiter) => {
    const { enqueueJobs, bulkAdd } = buildService();

    await expectInvalidInput(enqueueJobs({ limiter }));
    expect(bulkAdd).not.toHaveBeenCalled();
  });

  it.each([
    { max: 10, durationMs: 1_000 },
    { max: 1, durationMs: 60 * 60 * 1_000 },
  ])('paces the call with the limiter %o', async (limiter) => {
    const { enqueueJobs, bulkAdd } = buildService();

    await enqueueJobs({ limiter });

    expect(bulkAdd).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Array),
      expect.objectContaining({
        limiter,
        groupKey: `logicFunction:${LOGIC_FUNCTION_ID}:limiter:${limiter.max}:${limiter.durationMs}`,
      }),
    );
    expect(bulkAdd.mock.calls[0][2]).not.toHaveProperty('delay');
  });

  it('does not pace a call without a limiter', async () => {
    const { enqueueJobs, bulkAdd } = buildService();

    await enqueueJobs({ delayMs: 0 });

    expect(bulkAdd.mock.calls[0][2]).toMatchObject({ delay: 0 });
    expect(bulkAdd.mock.calls[0][2]).not.toHaveProperty('limiter');
    expect(bulkAdd.mock.calls[0][2]).not.toHaveProperty('groupKey');
  });

  it('returns the scheduledAt of each enqueued job', async () => {
    const { enqueueJobs } = buildService();

    const result = await enqueueJobs({});

    expect(result.jobs).toEqual([
      { jobId: 'job-1', sizeBytes: 100, scheduledAt: 1_000 },
      { jobId: 'job-2', sizeBytes: 100, scheduledAt: 1_001 },
    ]);
  });
});
