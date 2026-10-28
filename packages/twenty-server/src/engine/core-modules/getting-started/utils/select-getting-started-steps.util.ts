import { GETTING_STARTED_TRACKS } from 'src/engine/core-modules/getting-started/constants/getting-started-tracks.constant';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { GettingStartedTrack } from 'src/engine/core-modules/getting-started/enums/getting-started-track.enum';
import { type GettingStartedSelectionContext } from 'src/engine/core-modules/getting-started/types/getting-started-selection-context.type';

export const selectGettingStartedSteps = ({
  isWorkEmail,
  hasConnectedMailbox,
  hasInstalledFeaturedApp,
}: GettingStartedSelectionContext): {
  track: GettingStartedTrack;
  steps: GettingStartedStep[];
} => {
  const track =
    isWorkEmail === false
      ? GettingStartedTrack.PERSONAL
      : GettingStartedTrack.DEFAULT;

  const steps = GETTING_STARTED_TRACKS[track].filter((step) => {
    switch (step) {
      case GettingStartedStep.CONNECT_MAILBOX:
        return hasConnectedMailbox !== true;
      case GettingStartedStep.INSTALL_APP:
        return hasInstalledFeaturedApp !== true;
      default:
        return true;
    }
  });

  return { track, steps };
};
