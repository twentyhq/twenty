import { PermissionFlagType } from 'twenty-shared/constants';

import { GETTING_STARTED_STEP_ACTION_KEYS_BY_PROFILE } from 'src/engine/core-modules/getting-started/constants/getting-started-step-action-keys-by-profile.constant';
import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';
import { filterGettingStartedStepActionKeys } from 'src/engine/core-modules/getting-started/utils/filter-getting-started-step-action-keys.util';

const ALL_PERMISSION_FLAGS = Object.fromEntries(
  Object.values(PermissionFlagType).map((permissionFlag) => [
    permissionFlag,
    true,
  ]),
);

describe('filterGettingStartedStepActionKeys', () => {
  it.each([
    {
      profile: 'PERSONAL' as const,
      expected: [
        GettingStartedStepActionKey.IMPORT_DATA,
        GettingStartedStepActionKey.CONNECT_MAILBOX,
        GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL,
        GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        GettingStartedStepActionKey.INSTALL_APP,
      ],
    },
    {
      profile: 'SMALL_TEAM' as const,
      expected: [
        GettingStartedStepActionKey.CONNECT_MAILBOX,
        GettingStartedStepActionKey.IMPORT_DATA,
        GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL,
        GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        GettingStartedStepActionKey.INVITE_TEAM,
        GettingStartedStepActionKey.INSTALL_APP,
      ],
    },
    {
      profile: 'TEAM' as const,
      expected: [
        GettingStartedStepActionKey.CONNECT_MAILBOX,
        GettingStartedStepActionKey.IMPORT_DATA,
        GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL,
        GettingStartedStepActionKey.INVITE_TEAM,
        GettingStartedStepActionKey.HANDOVER_DEALS,
        GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        GettingStartedStepActionKey.INSTALL_APP,
      ],
    },
  ])(
    'should keep the $profile steps in order with every permission and a mailbox',
    ({ profile, expected }) => {
      expect(
        filterGettingStartedStepActionKeys({
          stepActionKeys: GETTING_STARTED_STEP_ACTION_KEYS_BY_PROFILE[profile],
          permissionFlags: ALL_PERMISSION_FLAGS,
          hasSendingMailbox: true,
          hasFeaturedApp: true,
        }),
      ).toEqual(expected);
    },
  );

  it('should leave out a step the user has no permission for', () => {
    const stepActionKeys = filterGettingStartedStepActionKeys({
      stepActionKeys: GETTING_STARTED_STEP_ACTION_KEYS_BY_PROFILE.TEAM,
      permissionFlags: {
        ...ALL_PERMISSION_FLAGS,
        [PermissionFlagType.IMPORT_CSV]: false,
      },
      hasSendingMailbox: true,
      hasFeaturedApp: true,
    });

    expect(stepActionKeys).not.toContain(
      GettingStartedStepActionKey.IMPORT_DATA,
    );
    expect(stepActionKeys).toContain(
      GettingStartedStepActionKey.CONNECT_MAILBOX,
    );
  });

  it('should leave out the data model step without the AI permission', () => {
    expect(
      filterGettingStartedStepActionKeys({
        stepActionKeys: GETTING_STARTED_STEP_ACTION_KEYS_BY_PROFILE.TEAM,
        permissionFlags: {
          ...ALL_PERMISSION_FLAGS,
          [PermissionFlagType.AI]: false,
        },
        hasSendingMailbox: true,
        hasFeaturedApp: true,
      }),
    ).not.toContain(GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL);
  });

  it('should leave out the handover step without a mailbox that can send', () => {
    expect(
      filterGettingStartedStepActionKeys({
        stepActionKeys: GETTING_STARTED_STEP_ACTION_KEYS_BY_PROFILE.TEAM,
        permissionFlags: ALL_PERMISSION_FLAGS,
        hasSendingMailbox: false,
        hasFeaturedApp: true,
      }),
    ).not.toContain(GettingStartedStepActionKey.HANDOVER_DEALS);
  });

  it('should leave out the install app step when no featured app is in the catalog', () => {
    expect(
      filterGettingStartedStepActionKeys({
        stepActionKeys: GETTING_STARTED_STEP_ACTION_KEYS_BY_PROFILE.PERSONAL,
        permissionFlags: ALL_PERMISSION_FLAGS,
        hasSendingMailbox: true,
        hasFeaturedApp: false,
      }),
    ).not.toContain(GettingStartedStepActionKey.INSTALL_APP);
  });
});
