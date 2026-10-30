import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { type GettingStartedProfile } from 'src/engine/core-modules/getting-started/types/getting-started-profile.type';

export const GETTING_STARTED_STEPS_BY_PROFILE: Record<
  GettingStartedProfile,
  GettingStartedStep[]
> = {
  PERSONAL: [
    GettingStartedStep.IMPORT_DATA,
    GettingStartedStep.CONNECT_MAILBOX,
    GettingStartedStep.CUSTOMIZE_DATA_MODEL,
    GettingStartedStep.FOLLOW_UP_DEALS,
    GettingStartedStep.INSTALL_APP,
  ],
  SMALL_TEAM: [
    GettingStartedStep.CONNECT_MAILBOX,
    GettingStartedStep.IMPORT_DATA,
    GettingStartedStep.CUSTOMIZE_DATA_MODEL,
    GettingStartedStep.FOLLOW_UP_DEALS,
    GettingStartedStep.INVITE_TEAM,
    GettingStartedStep.INSTALL_APP,
  ],
  TEAM: [
    GettingStartedStep.CONNECT_MAILBOX,
    GettingStartedStep.IMPORT_DATA,
    GettingStartedStep.CUSTOMIZE_DATA_MODEL,
    GettingStartedStep.INVITE_TEAM,
    GettingStartedStep.HANDOVER_DEALS,
    GettingStartedStep.FOLLOW_UP_DEALS,
    GettingStartedStep.INSTALL_APP,
  ],
};
