import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { TEAMS_CHAT_RECONCILE_ROUTE_PATH } from 'src/features/chat/constants/teams-chat-route-path';
import { type TeamsChatReconciliationResult } from 'src/features/chat/logic-functions/types/teams-chat-reconciliation.type';

const FALLBACK_RECONCILE_ERROR_RESULT: TeamsChatReconciliationResult = {
  success: false,
  message: 'Could not update Teams chat',
  error: 'The request failed. Please try again.',
};

type ReconcileTeamsChatState = {
  reconcileTeamsChat: (
    isEnabled: boolean,
  ) => Promise<TeamsChatReconciliationResult>;
  isReconciling: boolean;
};

export const useReconcileTeamsChat = (): ReconcileTeamsChatState => {
  const [isReconciling, setIsReconciling] = useState(false);

  const reconcileTeamsChat = async (
    isEnabled: boolean,
  ): Promise<TeamsChatReconciliationResult> => {
    setIsReconciling(true);

    try {
      const result = await new RestApiClient().post<
        TeamsChatReconciliationResult | undefined
      >(`/s${TEAMS_CHAT_RECONCILE_ROUTE_PATH}`, { isEnabled });

      return result ?? FALLBACK_RECONCILE_ERROR_RESULT;
    } catch (error) {
      console.error('Teams chat reconcile request failed', error);

      return FALLBACK_RECONCILE_ERROR_RESULT;
    } finally {
      setIsReconciling(false);
    }
  };

  return { reconcileTeamsChat, isReconciling };
};
