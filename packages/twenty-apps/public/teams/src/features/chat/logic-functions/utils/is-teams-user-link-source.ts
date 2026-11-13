import { TEAMS_USER_LINK_SOURCE } from 'src/features/chat/logic-functions/constants/teams-user-link-source';
import { type TeamsUserLinkSource } from 'src/features/chat/logic-functions/types/teams-user-link-source.type';

const TEAMS_USER_LINK_SOURCES: readonly string[] = Object.values(
  TEAMS_USER_LINK_SOURCE,
);

export const isTeamsUserLinkSource = (
  value: unknown,
): value is TeamsUserLinkSource =>
  typeof value === 'string' && TEAMS_USER_LINK_SOURCES.includes(value);
