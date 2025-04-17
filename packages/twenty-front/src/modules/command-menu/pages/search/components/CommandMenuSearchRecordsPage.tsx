import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useCommandMenuSearchRecords } from '@/command-menu/hooks/useCommandMenuSearchRecords';
import { useMemo } from 'react';

export const CommandMenuSearchRecordsPage = () => {
  const { commandGroups, loading, noResults } = useCommandMenuSearchRecords();

  const selectableItemIds = useMemo(() => {
    return commandGroups
      .flatMap((group) => group.items)
      .map((item) => item.key);
  }, [commandGroups]);

  return (
    <CommandMenuList
      commandGroups={commandGroups}
      selectableItemIds={selectableItemIds}
      loading={loading}
      noResults={noResults}
    />
  );
};
