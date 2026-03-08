import { RECORD_AGNOSTIC_COMMAND_MENU_ITEMS_CONFIG } from '@/command-menu-item/record-agnostic/constants/RecordAgnosticCommandMenuItemsConfig';
import { RecordAgnosticCommandKeys } from '@/command-menu-item/record-agnostic/types/RecordAgnosticCommandKeys';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useRecordAgnosticCommands = () => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  const actions: Record<string, CommandMenuItemConfig> = {
    [RecordAgnosticCommandKeys.SEARCH_RECORDS]:
      RECORD_AGNOSTIC_COMMAND_MENU_ITEMS_CONFIG[
        RecordAgnosticCommandKeys.SEARCH_RECORDS
      ],
    [RecordAgnosticCommandKeys.SEARCH_RECORDS_FALLBACK]:
      RECORD_AGNOSTIC_COMMAND_MENU_ITEMS_CONFIG[
        RecordAgnosticCommandKeys.SEARCH_RECORDS_FALLBACK
      ],
  };

  if (isAiEnabled) {
    actions[RecordAgnosticCommandKeys.ASK_AI] =
      RECORD_AGNOSTIC_COMMAND_MENU_ITEMS_CONFIG[
        RecordAgnosticCommandKeys.ASK_AI
      ];
    actions[RecordAgnosticCommandKeys.VIEW_PREVIOUS_AI_CHATS] =
      RECORD_AGNOSTIC_COMMAND_MENU_ITEMS_CONFIG[
        RecordAgnosticCommandKeys.VIEW_PREVIOUS_AI_CHATS
      ];
  }

  return actions;
};
