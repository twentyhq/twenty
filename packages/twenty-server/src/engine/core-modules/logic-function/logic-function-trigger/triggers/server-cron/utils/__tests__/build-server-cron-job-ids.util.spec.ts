import { buildServerCronDispatchJobId } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/utils/build-server-cron-dispatch-job-id.util';
import { buildServerCronStepJobId } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/utils/build-server-cron-step-job-id.util';

const stepJobIdInput = {
  applicationRegistrationId: '1e0f6d8a-2b39-4a51-9b6a-8f7c2b1d3e4f',
  logicFunctionUniversalIdentifier: 'a1b2c3d4-5c01-4a7b-8c9d-0e1f2a3b4c5d',
  scheduledAtEpochMs: 1790137800000,
  step: 2,
};

describe('server cron job ids', () => {
  it('builds a deterministic step job id without colons', () => {
    const stepJobId = buildServerCronStepJobId(stepJobIdInput);

    expect(stepJobId).toBe(
      'server-cron.1e0f6d8a-2b39-4a51-9b6a-8f7c2b1d3e4f.a1b2c3d4-5c01-4a7b-8c9d-0e1f2a3b4c5d.1790137800000.2',
    );
    expect(stepJobId).not.toContain(':');
    expect(buildServerCronStepJobId(stepJobIdInput)).toBe(stepJobId);
  });

  it('builds step job ids that differ by step', () => {
    expect(buildServerCronStepJobId(stepJobIdInput)).not.toBe(
      buildServerCronStepJobId({ ...stepJobIdInput, step: 3 }),
    );
  });

  it('builds dispatch job ids that cannot collide with application job ids', () => {
    const dispatchJobId = buildServerCronDispatchJobId({
      stepJobId: buildServerCronStepJobId(stepJobIdInput),
      workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
      targetLogicFunctionUniversalIdentifier:
        'b1b2c3d4-5c01-4a7b-8c9d-0e1f2a3b4c5d',
    });

    expect(dispatchJobId).toMatch(/^server-cron\./);
    expect(dispatchJobId).not.toMatch(/^[0-9a-f-]{36}\./);
    expect(dispatchJobId).not.toContain(':');
  });
});
