import { PAGE_COMMAND_ENGINE_COMPONENT_KEYS } from '@/command-menu-item/page-command/constants/PageCommandEngineComponentKeys';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

export const doesCommandMenuItemMatchPageCommands =
  (pageCommandKeys: string[]) => (item: CommandMenuItemFieldsFragment) =>
    !PAGE_COMMAND_ENGINE_COMPONENT_KEYS.has(item.engineComponentKey) ||
    pageCommandKeys.includes(item.engineComponentKey);
