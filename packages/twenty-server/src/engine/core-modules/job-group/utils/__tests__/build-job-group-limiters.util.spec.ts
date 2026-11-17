import { WORKFLOW_JOB_GROUP_KEY } from 'src/engine/core-modules/job-group/constants/workflow-job-group-key.constant';
import { buildJobGroupLimiters } from 'src/engine/core-modules/job-group/utils/build-job-group-limiters.util';

describe('buildJobGroupLimiters', () => {
  it('uses the default limiter of a job group the workspace does not override', () => {
    expect(
      buildJobGroupLimiters({
        jobGroupKeys: [WORKFLOW_JOB_GROUP_KEY],
        jobGroupConfigByKey: {},
      }),
    ).toEqual([{ key: 'jobGroup:workflow', max: 100, durationMs: 60_000 }]);
  });

  it('prefers the limiter the workspace set on the job group', () => {
    expect(
      buildJobGroupLimiters({
        jobGroupKeys: [WORKFLOW_JOB_GROUP_KEY],
        jobGroupConfigByKey: {
          [WORKFLOW_JOB_GROUP_KEY]: {
            limiter: { max: 1, durationMs: 1_000 },
          },
        },
      }),
    ).toEqual([{ key: 'jobGroup:workflow', max: 1, durationMs: 1_000 }]);
  });

  it('lets a workspace turn a default limiter off', () => {
    expect(
      buildJobGroupLimiters({
        jobGroupKeys: [WORKFLOW_JOB_GROUP_KEY],
        jobGroupConfigByKey: { [WORKFLOW_JOB_GROUP_KEY]: { limiter: null } },
      }),
    ).toEqual([]);
  });

  it('returns one limiter per job group, ignoring unknown and repeated keys', () => {
    expect(
      buildJobGroupLimiters({
        jobGroupKeys: ['imports', WORKFLOW_JOB_GROUP_KEY, 'unknown', 'imports'],
        jobGroupConfigByKey: {
          imports: { limiter: { max: 2, durationMs: 1_000 } },
        },
      }),
    ).toEqual([
      { key: 'jobGroup:imports', max: 2, durationMs: 1_000 },
      { key: 'jobGroup:workflow', max: 100, durationMs: 60_000 },
    ]);
  });

  it('returns no limiter without job group', () => {
    expect(
      buildJobGroupLimiters({ jobGroupKeys: [], jobGroupConfigByKey: {} }),
    ).toEqual([]);
  });
});
