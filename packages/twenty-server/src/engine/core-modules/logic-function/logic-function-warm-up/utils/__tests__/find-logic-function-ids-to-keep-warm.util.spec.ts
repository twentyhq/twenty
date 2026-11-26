import { findLogicFunctionIdsToKeepWarm } from 'src/engine/core-modules/logic-function/logic-function-warm-up/utils/find-logic-function-ids-to-keep-warm.util';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const WARM_PREBUILT_FUNCTION = {
  applicationId: 'active-application',
  deletedAt: null,
  isWarm: true,
  executionMode: LogicFunctionExecutionMode.PREBUILT,
  isBuildUpToDate: true,
  checksum: 'checksum',
};

describe('findLogicFunctionIdsToKeepWarm', () => {
  it('keeps only eligible functions of active applications', () => {
    expect(
      findLogicFunctionIdsToKeepWarm({
        flatLogicFunctions: [
          { ...WARM_PREBUILT_FUNCTION, id: 'warm' },
          { ...WARM_PREBUILT_FUNCTION, id: 'not-warm', isWarm: false },
          {
            ...WARM_PREBUILT_FUNCTION,
            id: 'live',
            executionMode: LogicFunctionExecutionMode.LIVE,
          },
          {
            ...WARM_PREBUILT_FUNCTION,
            id: 'deleted',
            deletedAt: '2026-01-01T00:00:00.000Z',
          },
          {
            ...WARM_PREBUILT_FUNCTION,
            id: 'inactive-application',
            applicationId: 'inactive-application',
          },
          undefined,
        ],
        isApplicationActive: (applicationId) =>
          applicationId === 'active-application',
      }),
    ).toEqual(['warm']);
  });
});
