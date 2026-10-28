import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { GettingStartedTrack } from 'src/engine/core-modules/getting-started/enums/getting-started-track.enum';

export const GETTING_STARTED_TRACKS: Record<
  GettingStartedTrack,
  GettingStartedStep[]
> = {
  [GettingStartedTrack.DEFAULT]: [
    GettingStartedStep.CONNECT_MAILBOX,
    GettingStartedStep.IMPORT_DATA,
    GettingStartedStep.INSTALL_APP,
    GettingStartedStep.INVITE_TEAM,
    GettingStartedStep.HANDOVER_DEALS,
    GettingStartedStep.FOLLOW_UP_DEALS,
  ],
  [GettingStartedTrack.PERSONAL]: [
    GettingStartedStep.CONNECT_MAILBOX,
    GettingStartedStep.IMPORT_DATA,
    GettingStartedStep.INSTALL_APP,
    GettingStartedStep.FOLLOW_UP_DEALS,
  ],
};
