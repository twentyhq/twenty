import { type TeamsUserLinkSource } from 'src/features/chat/logic-functions/types/teams-user-link-source.type';

export type TeamsUserLinkDraft = {
  name: string;
  teamsTenantId: string;
  teamsUserAadObjectId: string;
  workspaceMemberId: string;
  source: TeamsUserLinkSource;
};
