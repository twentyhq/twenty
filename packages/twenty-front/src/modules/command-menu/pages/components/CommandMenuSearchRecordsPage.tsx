import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useSearchRecords } from '@/command-menu/hooks/useSearchRecords';
import { useMemo } from 'react';

export const CommandMenuSearchRecordsPage = () => {
  const { commandGroups, loading, noResults } = useSearchRecords();

  const selectableItemIds = useMemo(() => {
    return commandGroups.flatMap((group) => group.items).map((item) => item.id);
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
