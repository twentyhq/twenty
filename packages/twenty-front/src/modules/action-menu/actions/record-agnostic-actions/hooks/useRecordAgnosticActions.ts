import { RECORD_AGNOSTIC_ACTIONS_CONFIG } from '@/action-menu/actions/record-agnostic-actions/constants/RecordAgnosticActionsConfig';
import { RecordAgnosticActionsKeys } from '@/action-menu/actions/record-agnostic-actions/types/RecordAgnosticActionsKeys';
import { type ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

export const useRecordAgnosticActions = () => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  const actions: Record<string, ActionConfig> = {
    [RecordAgnosticActionsKeys.SEARCH_RECORDS]:
      RECORD_AGNOSTIC_ACTIONS_CONFIG[RecordAgnosticActionsKeys.SEARCH_RECORDS],
    [RecordAgnosticActionsKeys.SEARCH_RECORDS_FALLBACK]:
      RECORD_AGNOSTIC_ACTIONS_CONFIG[
        RecordAgnosticActionsKeys.SEARCH_RECORDS_FALLBACK
      ],
  };

  if (isAiEnabled) {
    actions[RecordAgnosticActionsKeys.ASK_AI] =
      RECORD_AGNOSTIC_ACTIONS_CONFIG[RecordAgnosticActionsKeys.ASK_AI];
    actions[RecordAgnosticActionsKeys.VIEW_PREVIOUS_AI_CHATS] =
      RECORD_AGNOSTIC_ACTIONS_CONFIG[
        RecordAgnosticActionsKeys.VIEW_PREVIOUS_AI_CHATS
      ];
  }

  return actions;
};
