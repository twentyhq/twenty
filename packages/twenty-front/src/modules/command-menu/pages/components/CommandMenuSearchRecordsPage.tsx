import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useSearchRecords } from '@/command-menu/hooks/useSearchRecords';

export const CommandMenuSearchRecordsPage = () => {
  const { commandGroups, loading, noResults } = useSearchRecords();

  return (
    <CommandMenuList
      commandGroups={commandGroups}
      selectableItemIds={commandGroups.flatMap((group) =>
        group.items.map((item) => item.id),
      )}
      loading={loading}
      noResults={noResults}
    />
  );
};
