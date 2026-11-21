import { RestApiClient } from 'twenty-client-sdk/rest';

import { TEAMS_CHAT_RECONCILE_ROUTE_PATH } from 'src/features/chat/constants/teams-chat-route-path';
import { type TeamsChatReconciliationResult } from 'src/features/chat/logic-functions/types/teams-chat-reconciliation.type';

export const reconcileTeamsChat = async (
  isEnabled: boolean,
): Promise<TeamsChatReconciliationResult | undefined> => {
  try {
    return await new RestApiClient().post<
      TeamsChatReconciliationResult | undefined
    >(`/s${TEAMS_CHAT_RECONCILE_ROUTE_PATH}`, { isEnabled });
  } catch (error) {
    console.error('Teams chat reconcile request failed', error);

    return undefined;
  }
};
