import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';
import { type GettingStartedProfile } from 'src/engine/core-modules/getting-started/types/getting-started-profile.type';

export const GETTING_STARTED_STEP_ACTION_KEYS_BY_PROFILE: Record<
  GettingStartedProfile,
  GettingStartedStepActionKey[]
> = {
  PERSONAL: [
    GettingStartedStepActionKey.IMPORT_DATA,
    GettingStartedStepActionKey.CONNECT_MAILBOX,
    GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL,
    GettingStartedStepActionKey.FOLLOW_UP_DEALS,
    GettingStartedStepActionKey.INSTALL_APP,
  ],
  SMALL_TEAM: [
    GettingStartedStepActionKey.CONNECT_MAILBOX,
    GettingStartedStepActionKey.IMPORT_DATA,
    GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL,
    GettingStartedStepActionKey.FOLLOW_UP_DEALS,
    GettingStartedStepActionKey.INVITE_TEAM,
    GettingStartedStepActionKey.INSTALL_APP,
  ],
  TEAM: [
    GettingStartedStepActionKey.CONNECT_MAILBOX,
    GettingStartedStepActionKey.IMPORT_DATA,
    GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL,
    GettingStartedStepActionKey.INVITE_TEAM,
    GettingStartedStepActionKey.HANDOVER_DEALS,
    GettingStartedStepActionKey.FOLLOW_UP_DEALS,
    GettingStartedStepActionKey.INSTALL_APP,
  ],
};
