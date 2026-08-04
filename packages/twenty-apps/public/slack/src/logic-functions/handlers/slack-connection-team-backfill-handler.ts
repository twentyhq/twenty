import { backfillSlackConnectedAccountTeams } from 'src/logic-functions/utils/backfill-slack-connected-account-teams';

export const slackConnectionTeamBackfillHandler = () =>
  backfillSlackConnectedAccountTeams();
