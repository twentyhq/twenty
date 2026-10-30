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
  it.each([
    {
      profile: 'PERSONAL' as const,
      expected: [
        GettingStartedStep.IMPORT_DATA,
        GettingStartedStep.CONNECT_MAILBOX,
        GettingStartedStep.CUSTOMIZE_DATA_MODEL,
        GettingStartedStep.FOLLOW_UP_DEALS,
        GettingStartedStep.INSTALL_APP,
      ],
    },
    {
      profile: 'SMALL_TEAM' as const,
      expected: [
        GettingStartedStep.CONNECT_MAILBOX,
        GettingStartedStep.IMPORT_DATA,
        GettingStartedStep.CUSTOMIZE_DATA_MODEL,
        GettingStartedStep.FOLLOW_UP_DEALS,
        GettingStartedStep.INVITE_TEAM,
        GettingStartedStep.INSTALL_APP,
      ],
    },
    {
      profile: 'TEAM' as const,
      expected: [
        GettingStartedStep.CONNECT_MAILBOX,
        GettingStartedStep.IMPORT_DATA,
        GettingStartedStep.CUSTOMIZE_DATA_MODEL,
        GettingStartedStep.INVITE_TEAM,
        GettingStartedStep.HANDOVER_DEALS,
        GettingStartedStep.FOLLOW_UP_DEALS,
        GettingStartedStep.INSTALL_APP,
      ],
    },
  ])(
    'should list the $profile steps in order with every permission and a mailbox',
    ({ profile, expected }) => {
      expect(
        getGettingStartedSteps({
          profile,
          permissionFlags: ALL_PERMISSION_FLAGS,
          hasSendingMailbox: true,
          hasFeaturedApp: true,
        }),
      ).toEqual(expected);
    },
  );

  it('should leave out a step the user has no permission for', () => {
    const steps = getGettingStartedSteps({
      profile: 'TEAM',
      permissionFlags: {
        ...ALL_PERMISSION_FLAGS,
        [PermissionFlagType.IMPORT_CSV]: false,
      },
      hasSendingMailbox: true,
      hasFeaturedApp: true,
    });

    expect(steps).not.toContain(GettingStartedStep.IMPORT_DATA);
    expect(steps).toContain(GettingStartedStep.CONNECT_MAILBOX);
  });

  it('should leave out the data model step without the AI permission', () => {
    expect(
      getGettingStartedSteps({
        profile: 'TEAM',
        permissionFlags: {
          ...ALL_PERMISSION_FLAGS,
          [PermissionFlagType.AI]: false,
        },
        hasSendingMailbox: true,
        hasFeaturedApp: true,
      }),
    ).not.toContain(GettingStartedStep.CUSTOMIZE_DATA_MODEL);
  });

  it('should leave out the handover step without a mailbox that can send', () => {
    expect(
      getGettingStartedSteps({
        profile: 'TEAM',
        permissionFlags: ALL_PERMISSION_FLAGS,
        hasSendingMailbox: false,
        hasFeaturedApp: true,
      }),
    ).not.toContain(GettingStartedStep.HANDOVER_DEALS);
  });

  it('should leave out the install app step when no featured app is in the catalog', () => {
    expect(
      getGettingStartedSteps({
        profile: 'PERSONAL',
        permissionFlags: ALL_PERMISSION_FLAGS,
        hasSendingMailbox: true,
        hasFeaturedApp: false,
      }),
    ).not.toContain(GettingStartedStep.INSTALL_APP);
  });
});
