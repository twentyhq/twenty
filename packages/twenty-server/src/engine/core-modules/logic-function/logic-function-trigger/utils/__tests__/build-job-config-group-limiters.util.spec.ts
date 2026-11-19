import { buildJobConfigGroupLimiters } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-job-config-group-limiters.util';

const API_LIMITER = { max: 50, durationMs: 60_000 };
const BACKFILL_LIMITER = { max: 10, durationMs: 60_000 };

describe('buildJobConfigGroupLimiters', () => {
  it('should map each declared key to a limiter scoped to the application', () => {
    expect(
      buildJobConfigGroupLimiters({
        applicationUniversalIdentifier: 'app-1',
        jobConfigs: [
          { key: 'api', limiter: API_LIMITER },
          { key: 'backfill', limiter: BACKFILL_LIMITER },
        ],
        jobConfigKeys: ['api', 'backfill', 'api', undefined],
      }),
    ).toEqual([
      { groupKey: 'application:app-1:jobConfig:api', limiter: API_LIMITER },
      {
        groupKey: 'application:app-1:jobConfig:backfill',
        limiter: BACKFILL_LIMITER,
      },
    ]);
  });

  it('should ignore keys that are not declared', () => {
    expect(
      buildJobConfigGroupLimiters({
        applicationUniversalIdentifier: 'app-1',
        jobConfigs: [],
        jobConfigKeys: ['api'],
      }),
    ).toEqual([]);
  });
});
