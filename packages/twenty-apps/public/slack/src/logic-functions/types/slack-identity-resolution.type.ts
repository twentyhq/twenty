import { type SlackMemberProvenance } from 'src/logic-functions/types/slack-member-provenance.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { type SlackUserLinkSummary } from 'src/logic-functions/types/slack-user-link-summary.type';

type SlackIdentityResolutionBase = {
  slackUserId: string;
  identity: SlackUserIdentity | undefined;
  link: SlackUserLinkSummary | undefined;
};

export type SlackIdentityResolution = SlackIdentityResolutionBase &
  (
    | {
        outcome: 'confirmedMember';
        workspaceMemberId: string;
        memberProvenance: SlackMemberProvenance;
      }
    | { outcome: 'membershipNotConfirmed' }
    | { outcome: 'unidentified' }
  );
