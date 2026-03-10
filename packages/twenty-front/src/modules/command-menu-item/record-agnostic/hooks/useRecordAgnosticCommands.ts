import { RECORD_AGNOSTIC_COMMAND_MENU_ITEMS_CONFIG } from '@/command-menu-item/record-agnostic/constants/RecordAgnosticCommandMenuItemsConfig';
import { RecordAgnosticCommandKeys } from '@/command-menu-item/record-agnostic/types/RecordAgnosticCommandKeys';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useRecordAgnosticCommands = () => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  const commandMenuItems: Record<string, CommandMenuItemConfig> = {
    [RecordAgnosticCommandKeys.SEARCH_RECORDS]:
      RECORD_AGNOSTIC_COMMAND_MENU_ITEMS_CONFIG[
        RecordAgnosticCommandKeys.SEARCH_RECORDS
      ],
    [RecordAgnosticCommandKeys.SEARCH_RECORDS_FALLBACK]:
      RECORD_AGNOSTIC_COMMAND_MENU_ITEMS_CONFIG[
        RecordAgnosticCommandKeys.SEARCH_RECORDS_FALLBACK
      ],
    [RecordAgnosticCommandKeys.EDIT_NAVIGATION_SIDEBAR]:
      RECORD_AGNOSTIC_COMMAND_MENU_ITEMS_CONFIG[
        RecordAgnosticCommandKeys.EDIT_NAVIGATION_SIDEBAR
      ],
  };

  if (isAiEnabled) {
    commandMenuItems[RecordAgnosticCommandKeys.ASK_AI] =
      RECORD_AGNOSTIC_COMMAND_MENU_ITEMS_CONFIG[
        RecordAgnosticCommandKeys.ASK_AI
      ];
    commandMenuItems[RecordAgnosticCommandKeys.VIEW_PREVIOUS_AI_CHATS] =
      RECORD_AGNOSTIC_COMMAND_MENU_ITEMS_CONFIG[
        RecordAgnosticCommandKeys.VIEW_PREVIOUS_AI_CHATS
      ];
  }

  return commandMenuItems;
};
