import { isNonEmptyString } from '@sniptt/guards';
import { type RoutePayload } from 'twenty-sdk/define';

import { type TeamsSetUserLinkInput } from 'src/features/chat/logic-functions/types/teams-set-user-link-input.type';

export type TeamsSetUserLinkPayload =
  | TeamsSetUserLinkInput
  | Pick<RoutePayload<Partial<TeamsSetUserLinkInput>>, 'body'>;

const isRoutePayload = (
  payload: TeamsSetUserLinkPayload,
): payload is Pick<RoutePayload<Partial<TeamsSetUserLinkInput>>, 'body'> =>
  'body' in payload;

const readOptionalString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;

export const extractTeamsSetUserLinkInput = (
  payload: TeamsSetUserLinkPayload,
): TeamsSetUserLinkInput => {
  const source = isRoutePayload(payload) ? (payload.body ?? {}) : payload;

  return {
    workspaceMemberId: readOptionalString(source.workspaceMemberId) ?? '',
    teamsUserAadObjectId: readOptionalString(source.teamsUserAadObjectId) ?? '',
    name: readOptionalString(source.name),
  };
};
