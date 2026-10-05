import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

// Mirrors the run-as rule: an account only vouches for an email when it is a
// regular member of the installed workspace, so a guest or Slack Connect
// account never resolves a member by email alone.
export const isLinkableSlackIdentity = ({
  identity,
  installedSlackTeamId,
}: {
  identity:
    | {
        slackTeamId: string | undefined;
        email: string | undefined;
        isRegularUserAccount: boolean;
      }
    | undefined;
  installedSlackTeamId: string | undefined;
}): boolean =>
  isDefined(identity) &&
  identity.isRegularUserAccount &&
  isNonEmptyString(identity.email) &&
  isNonEmptyString(installedSlackTeamId) &&
  identity.slackTeamId === installedSlackTeamId;
