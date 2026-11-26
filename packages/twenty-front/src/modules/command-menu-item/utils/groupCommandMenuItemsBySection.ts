import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';
import { resolveCommandMenuItemSection } from '@/command-menu-item/utils/resolveCommandMenuItemSection';

export const groupCommandMenuItemsBySection = <
  TCommandMenuItem extends Pick<
    CommandMenuItemDefinition,
    'engineComponentKey' | 'availabilityType' | 'creationTargetObjectMetadataId'
  >,
>(
  commandMenuItems: TCommandMenuItem[],
): Record<CommandMenuItemSection, TCommandMenuItem[]> => {
  const commandMenuItemsBySection: Record<
    CommandMenuItemSection,
    TCommandMenuItem[]
  > = {
    SELECTION: [],
    CURRENT_VIEW: [],
    THIS_OBJECT: [],
    WORKSPACE: [],
    GO_TO: [],
    CREATE_RECORD: [],
    DEVELOPER: [],
    ASK_AI: [],
    SEARCH: [],
    FALLBACK: [],
  };

  for (const commandMenuItem of commandMenuItems) {
    commandMenuItemsBySection[
      resolveCommandMenuItemSection(commandMenuItem)
    ].push(commandMenuItem);
  }

  return commandMenuItemsBySection;
};
