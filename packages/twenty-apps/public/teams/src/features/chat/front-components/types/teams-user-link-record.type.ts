import { type TeamsUserLinkSource } from 'src/features/chat/logic-functions/types/teams-user-link-source.type';

export type TeamsUserLinkRecord = {
  id: string;
  name: string;
  workspaceMemberName: string;
  source: TeamsUserLinkSource | undefined;
};
