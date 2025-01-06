import { Command } from '@/command-menu/types/Command';
import { isNonEmptyString } from '@sniptt/guards';
import { useDebounce } from 'use-debounce';

export const useMatchCommands = ({
  commandMenuSearch,
}: {
  commandMenuSearch: string;
}) => {
  const [deferredCommandMenuSearch] = useDebounce(commandMenuSearch, 300); // 200ms - 500ms

  const checkInShortcuts = (cmd: Command, search: string) => {
    return (cmd.firstHotKey + (cmd.secondHotKey ?? ''))
      .toLowerCase()
      .includes(search.toLowerCase());
  };

  const checkInLabels = (cmd: Command, search: string) => {
    if (isNonEmptyString(cmd.label)) {
      return cmd.label.toLowerCase().includes(search.toLowerCase());
    }
    return false;
  };

  const matchCommands = (commands: Command[]) => {
    return commands.filter((cmd) =>
      deferredCommandMenuSearch.length > 0
        ? checkInShortcuts(cmd, deferredCommandMenuSearch) ||
          checkInLabels(cmd, deferredCommandMenuSearch)
        : true,
    );
  };

  return {
    matchCommands,
  };
};
