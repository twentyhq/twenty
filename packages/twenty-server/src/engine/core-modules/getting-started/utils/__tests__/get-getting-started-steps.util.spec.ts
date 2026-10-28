import { PermissionFlagType } from 'twenty-shared/constants';

import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { getGettingStartedSteps } from 'src/engine/core-modules/getting-started/utils/get-getting-started-steps.util';

const ALL_PERMISSION_FLAGS = Object.fromEntries(
  Object.values(PermissionFlagType).map((permissionFlag) => [
    permissionFlag,
    true,
  ]),
);

describe('getGettingStartedSteps', () => {
  it('should list every step for a work email with every permission and a mailbox', () => {
    expect(
      getGettingStartedSteps({
        userEmail: 'jane@acme.com',
        permissionFlags: ALL_PERMISSION_FLAGS,
        hasSendingMailbox: true,
      }),
    ).toEqual(Object.values(GettingStartedStep));
  });

  it('should leave out the team steps for a personal email', () => {
    const steps = getGettingStartedSteps({
      userEmail: 'jane@gmail.com',
      permissionFlags: ALL_PERMISSION_FLAGS,
      hasSendingMailbox: true,
    });

    expect(steps).not.toContain(GettingStartedStep.INVITE_TEAM);
    expect(steps).not.toContain(GettingStartedStep.HANDOVER_DEALS);
    expect(steps).toContain(GettingStartedStep.CONNECT_MAILBOX);
  });

  it('should leave out a step the user has no permission for', () => {
    const steps = getGettingStartedSteps({
      userEmail: 'jane@acme.com',
      permissionFlags: {
        ...ALL_PERMISSION_FLAGS,
        [PermissionFlagType.IMPORT_CSV]: false,
      },
      hasSendingMailbox: true,
    });

    expect(steps).not.toContain(GettingStartedStep.IMPORT_DATA);
    expect(steps).toContain(GettingStartedStep.CONNECT_MAILBOX);
  });

  it('should leave out the handover step without a mailbox that can send', () => {
    expect(
      getGettingStartedSteps({
        userEmail: 'jane@acme.com',
        permissionFlags: ALL_PERMISSION_FLAGS,
        hasSendingMailbox: false,
      }),
    ).not.toContain(GettingStartedStep.HANDOVER_DEALS);
  });
});
