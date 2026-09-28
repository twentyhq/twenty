import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { type CommandMenuItemSection } from '@/command-menu-item/types/CommandMenuItemSection';
import { resolveCommandMenuItemSection } from '@/command-menu-item/utils/resolveCommandMenuItemSection';

export const groupCommandMenuItemsBySection = (
  commandMenuItems: CommandMenuItemDefinition[],
): Record<CommandMenuItemSection, CommandMenuItemDefinition[]> => {
  const commandMenuItemsBySection: Record<
    CommandMenuItemSection,
    CommandMenuItemDefinition[]
  > = {
    SELECTION: [],
    CURRENT_VIEW: [],
    THIS_OBJECT: [],
    ASK_AND_FIND: [],
    CREATE_RECORD: [],
    WORKSPACE: [],
    GO_TO: [],
    DEVELOPER: [],
    FALLBACK: [],
  };

  for (const commandMenuItem of commandMenuItems) {
    commandMenuItemsBySection[
      resolveCommandMenuItemSection(commandMenuItem)
    ].push(commandMenuItem);
  }

  return commandMenuItemsBySection;
};
