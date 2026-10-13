import { type TEAMS_USER_LINK_SOURCE } from 'src/features/chat/logic-functions/constants/teams-user-link-source';

export type TeamsUserLinkSource =
  (typeof TEAMS_USER_LINK_SOURCE)[keyof typeof TEAMS_USER_LINK_SOURCE];
