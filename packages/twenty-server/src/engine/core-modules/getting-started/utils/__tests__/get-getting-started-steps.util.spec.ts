import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { getGettingStartedSteps } from 'src/engine/core-modules/getting-started/utils/get-getting-started-steps.util';

describe('getGettingStartedSteps', () => {
  it('should include the team steps for a work email', () => {
    expect(getGettingStartedSteps({ userEmail: 'jane@acme.com' })).toEqual(
      Object.values(GettingStartedStep),
    );
  });

  it('should leave out the team steps for a personal email', () => {
    const steps = getGettingStartedSteps({ userEmail: 'jane@gmail.com' });

    expect(steps).not.toContain(GettingStartedStep.INVITE_TEAM);
    expect(steps).not.toContain(GettingStartedStep.HANDOVER_DEALS);
    expect(steps).toContain(GettingStartedStep.CONNECT_MAILBOX);
  });
});
