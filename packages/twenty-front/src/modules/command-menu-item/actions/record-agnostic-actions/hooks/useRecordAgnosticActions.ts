import { RECORD_AGNOSTIC_ACTIONS_CONFIG } from '@/command-menu-item/actions/record-agnostic-actions/constants/RecordAgnosticActionsConfig';
import { RecordAgnosticActionsKeys } from '@/command-menu-item/actions/record-agnostic-actions/types/RecordAgnosticActionsKeys';
import { type CommandMenuItemConfig } from '@/command-menu-item/actions/types/CommandMenuItemConfig';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useRecordAgnosticActions = () => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  const actions: Record<string, CommandMenuItemConfig> = {
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
