import { type TeamsUserLinkSource } from 'src/features/chat/logic-functions/types/teams-user-link-source.type';

export type TeamsUserLink = {
  id: string;
  workspaceMemberId: string | undefined;
  source: TeamsUserLinkSource | undefined;
};
